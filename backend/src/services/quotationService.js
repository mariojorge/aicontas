const axios = require('axios');
const db = require('../database/connection');

class QuotationService {
  constructor() {
    // brapi.dev - API gratuita para ações brasileiras
    this.apiBaseUrl = 'https://brapi.dev/api';
    this.apiToken = process.env.BRAPI_TOKEN || null; // Opcional para tier gratuito
    this.requestTimeout = 10000; // 10 segundos
    this.rateLimitDelay = 1000; // 1 segundo entre requisições
  }

  /**
   * Busca cotação de um único ativo
   * @param {string} ticker - Código do ativo (PETR4, IVVB11, etc.)
   * @returns {Promise<Object|null>}
   */
  async fetchSingleQuote(ticker) {
    try {
      const url = `${this.apiBaseUrl}/quote/${ticker}`;
      const params = {};
      
      // Adicionar token se disponível
      if (this.apiToken) {
        params.token = this.apiToken;
      }

      console.log(`🔄 Buscando cotação para ${ticker}...`);
      
      const response = await axios.get(url, {
        params,
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': 'FinanceControl/1.0.0'
        }
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const quote = response.data.results[0];
        
        return {
          ticker: ticker,
          price: parseFloat(quote.regularMarketPrice) || 0,
          changePercent: parseFloat(quote.regularMarketChangePercent) || 0,
          changePrice: parseFloat(quote.regularMarketChange) || 0,
          updatedAt: new Date().toISOString(),
          success: true
        };
      }

      console.warn(`⚠️ Nenhum dado encontrado para ${ticker}`);
      return null;

    } catch (error) {
      console.error(`❌ Erro ao buscar cotação para ${ticker}:`, error.message);
      
      // Log mais detalhado para debugging
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
      
      return null;
    }
  }

  /**
   * Busca cotações de múltiplos ativos
   * @param {string[]} tickers - Array de códigos dos ativos
   * @returns {Promise<Object[]>}
   */
  async fetchMultipleQuotes(tickers) {
    const quotes = [];
    
    console.log(`📊 Iniciando busca de cotações para ${tickers.length} ativos...`);

    for (const ticker of tickers) {
      try {
        const quote = await this.fetchSingleQuote(ticker);
        if (quote) {
          quotes.push(quote);
        }
        
        // Delay para respeitar rate limits
        if (tickers.indexOf(ticker) < tickers.length - 1) {
          await this.sleep(this.rateLimitDelay);
        }
        
      } catch (error) {
        console.error(`❌ Erro processando ${ticker}:`, error.message);
      }
    }

    console.log(`✅ Cotações obtidas: ${quotes.length}/${tickers.length}`);
    return quotes;
  }

  /**
   * Atualiza cotações no banco de dados
   * @param {Object[]} quotes - Array de cotações
   * @returns {Promise<Object>}
   */
  async updateQuotesInDatabase(quotes) {
    let updated = 0;
    let failed = 0;

    for (const quote of quotes) {
      try {
        const result = await db.run(`
          UPDATE investment_assets 
          SET 
            preco_atual = ?,
            data_ultima_cotacao = DATE('now'),
            variacao_percentual = ?,
            variacao_absoluta = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE ticker = ? AND ativo = 1
        `, [
          quote.price,
          quote.changePercent,
          quote.changePrice,
          quote.ticker
        ]);

        if (result.changes > 0) {
          updated++;
          console.log(`✅ ${quote.ticker}: R$ ${quote.price.toFixed(2)} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
        } else {
          console.warn(`⚠️ Nenhum ativo encontrado para ticker ${quote.ticker}`);
        }

      } catch (error) {
        failed++;
        console.error(`❌ Erro ao atualizar ${quote.ticker}:`, error.message);
      }
    }

    return {
      total: quotes.length,
      updated,
      failed,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Busca todos os ativos ativos que têm ticker
   * @returns {Promise<string[]>}
   */
  async getActiveAssetTickers() {
    try {
      const assets = await db.all(`
        SELECT ticker 
        FROM investment_assets 
        WHERE ativo = 1 
          AND ticker IS NOT NULL 
          AND ticker != ''
          AND tipo IN ('acao', 'fii', 'etf')
      `);
      
      return assets.map(asset => asset.ticker);
    } catch (error) {
      console.error('❌ Erro ao buscar tickers ativos:', error.message);
      return [];
    }
  }

  /**
   * Executa atualização completa de cotações
   * @returns {Promise<Object>}
   */
  async updateAllQuotes() {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Iniciando atualização de cotações...');
      
      // Buscar tickers ativos
      const tickers = await this.getActiveAssetTickers();
      
      if (tickers.length === 0) {
        console.log('ℹ️ Nenhum ativo com ticker encontrado');
        return {
          success: true,
          message: 'Nenhum ativo com ticker para atualizar',
          total: 0,
          updated: 0,
          failed: 0,
          duration: 0
        };
      }

      console.log(`📋 Encontrados ${tickers.length} ativos: ${tickers.join(', ')}`);
      
      // Buscar cotações
      const quotes = await this.fetchMultipleQuotes(tickers);
      
      // Atualizar no banco
      const result = await this.updateQuotesInDatabase(quotes);
      
      const duration = Date.now() - startTime;
      
      console.log(`🎯 Atualização concluída em ${duration}ms`);
      console.log(`📊 Resumo: ${result.updated} atualizados, ${result.failed} falhas`);
      
      return {
        success: true,
        message: 'Cotações atualizadas com sucesso',
        duration,
        ...result
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Erro na atualização de cotações:', error.message);
      
      return {
        success: false,
        message: error.message,
        duration,
        total: 0,
        updated: 0,
        failed: 0
      };
    }
  }

  /**
   * Função auxiliar para delay
   * @param {number} ms - Milissegundos para aguardar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica status da última atualização
   * @returns {Promise<Object>}
   */
  async getQuotationStatus() {
    try {
      const result = await db.get(`
        SELECT 
          COUNT(*) as total_assets,
          COUNT(CASE WHEN preco_atual IS NOT NULL THEN 1 END) as with_quotes,
          MAX(data_ultima_cotacao) as last_update_date,
          COUNT(CASE WHEN data_ultima_cotacao = DATE('now') THEN 1 END) as updated_today
        FROM investment_assets 
        WHERE ativo = 1 AND ticker IS NOT NULL
      `);

      return {
        totalAssets: result.total_assets || 0,
        withQuotes: result.with_quotes || 0,
        lastUpdateDate: result.last_update_date,
        updatedToday: result.updated_today || 0,
        coverage: result.total_assets > 0 ? ((result.with_quotes / result.total_assets) * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('❌ Erro ao buscar status:', error.message);
      return {
        totalAssets: 0,
        withQuotes: 0,
        lastUpdateDate: null,
        updatedToday: 0,
        coverage: 0
      };
    }
  }
}

module.exports = new QuotationService();