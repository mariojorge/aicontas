const quotationService = require('../services/quotationService');
const dailyQuotationJob = require('../jobs/dailyQuotationJob');

const quotationController = {
  /**
   * Atualiza todas as cotações manualmente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateAll(req, res) {
    try {
      console.log(`🔧 Atualização manual solicitada por usuário ${req.user.id}`);
      
      const result = await quotationService.updateAllQuotes();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Cotações atualizadas com sucesso',
          data: {
            total: result.total,
            updated: result.updated,
            failed: result.failed,
            duration: result.duration,
            timestamp: result.timestamp
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Erro ao atualizar cotações',
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Erro no controller updateAll:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualiza cotação de um ativo específico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateAsset(req, res) {
    try {
      const { ticker } = req.params;
      
      if (!ticker) {
        return res.status(400).json({
          success: false,
          message: 'Ticker é obrigatório'
        });
      }

      console.log(`🔧 Atualização manual do ticker ${ticker} por usuário ${req.user.id}`);
      
      // Buscar cotação individual
      const quote = await quotationService.fetchSingleQuote(ticker.toUpperCase());
      
      if (!quote) {
        return res.status(404).json({
          success: false,
          message: `Cotação não encontrada para ${ticker}`
        });
      }

      // Atualizar no banco
      const result = await quotationService.updateQuotesInDatabase([quote]);
      
      if (result.updated > 0) {
        res.json({
          success: true,
          message: `Cotação de ${ticker} atualizada com sucesso`,
          data: {
            ticker: quote.ticker,
            price: quote.price,
            changePercent: quote.changePercent,
            changePrice: quote.changePrice,
            updatedAt: quote.updatedAt
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Ativo ${ticker} não encontrado no sistema ou inativo`
        });
      }

    } catch (error) {
      console.error(`❌ Erro ao atualizar ${req.params.ticker}:`, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar cotação',
        error: error.message
      });
    }
  },

  /**
   * Retorna status das cotações
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getStatus(req, res) {
    try {
      const status = await quotationService.getQuotationStatus();
      const jobInfo = dailyQuotationJob.getInfo();
      const shouldExecute = dailyQuotationJob.shouldExecute();
      
      res.json({
        success: true,
        data: {
          ...status,
          job: {
            ...jobInfo,
            nextExecution: shouldExecute,
            lastRunWouldExecute: shouldExecute.should
          }
        }
      });
    } catch (error) {
      console.error('❌ Erro ao buscar status:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar status das cotações',
        error: error.message
      });
    }
  },

  /**
   * Executa job de cotações manualmente (força execução)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async runJob(req, res) {
    try {
      console.log(`🤖 Job manual iniciado por usuário ${req.user.id}`);
      
      const result = await dailyQuotationJob.forceExecute();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Job executado com sucesso',
          data: result
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro na execução do job',
          data: result
        });
      }
    } catch (error) {
      console.error('❌ Erro ao executar job:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao executar job de cotações',
        error: error.message
      });
    }
  },

  /**
   * Busca cotação em tempo real de um ticker (sem salvar)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getLiveQuote(req, res) {
    try {
      const { ticker } = req.params;
      
      if (!ticker) {
        return res.status(400).json({
          success: false,
          message: 'Ticker é obrigatório'
        });
      }

      console.log(`📈 Cotação em tempo real solicitada para ${ticker}`);
      
      const quote = await quotationService.fetchSingleQuote(ticker.toUpperCase());
      
      if (quote) {
        res.json({
          success: true,
          data: quote
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Cotação não encontrada para ${ticker}`
        });
      }

    } catch (error) {
      console.error(`❌ Erro ao buscar cotação live para ${req.params.ticker}:`, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar cotação em tempo real',
        error: error.message
      });
    }
  },

  /**
   * Lista ativos com cotações desatualizadas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getOutdatedAssets(req, res) {
    try {
      const db = require('../database/connection');
      
      const assets = await db.all(`
        SELECT 
          id,
          nome,
          ticker,
          tipo,
          preco_atual,
          data_ultima_cotacao,
          JULIANDAY('now') - JULIANDAY(data_ultima_cotacao) as days_outdated
        FROM investment_assets 
        WHERE ativo = 1 
          AND ticker IS NOT NULL 
          AND ticker != ''
          AND (
            data_ultima_cotacao IS NULL 
            OR data_ultima_cotacao < DATE('now', '-1 day')
          )
        ORDER BY days_outdated DESC NULLS LAST
      `);

      res.json({
        success: true,
        data: assets,
        total: assets.length
      });

    } catch (error) {
      console.error('❌ Erro ao buscar ativos desatualizados:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar ativos desatualizados',
        error: error.message
      });
    }
  }
};

module.exports = quotationController;