const quotationService = require('../services/quotationService');

class DailyQuotationJob {
  constructor() {
    this.name = 'DailyQuotationJob';
    this.description = 'Atualiza cotações diariamente após fechamento da bolsa';
  }

  /**
   * Executa o job de atualização de cotações
   * @returns {Promise<Object>}
   */
  async execute() {
    const executionId = Date.now();
    
    console.log(`\n🤖 [${this.name}] Iniciando execução #${executionId}`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    
    try {
      // Verificar se é dia útil (segunda a sexta)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const message = 'Fim de semana - pular atualização de cotações';
        console.log(`📅 ${message}`);
        return {
          success: true,
          skipped: true,
          reason: message,
          executionId
        };
      }

      // Verificar horário (só executar após 19h em dias úteis)
      const hour = now.getHours();
      if (hour < 19) {
        const message = `Muito cedo (${hour}h) - aguardar fechamento da bolsa (19h)`;
        console.log(`⏰ ${message}`);
        return {
          success: true,
          skipped: true,
          reason: message,
          executionId
        };
      }

      console.log('✅ Condições adequadas para atualização de cotações');
      
      // Executar atualização
      const result = await quotationService.updateAllQuotes();
      
      // Log do resultado
      if (result.success) {
        console.log(`✅ [${this.name}] Execução #${executionId} concluída com sucesso`);
        console.log(`📊 Resumo: ${result.updated}/${result.total} ativos atualizados em ${result.duration}ms`);
        
        if (result.failed > 0) {
          console.warn(`⚠️ ${result.failed} ativos falharam na atualização`);
        }
      } else {
        console.error(`❌ [${this.name}] Execução #${executionId} falhou: ${result.message}`);
      }

      return {
        ...result,
        executionId,
        jobName: this.name,
        executedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [${this.name}] Erro na execução #${executionId}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        executionId,
        jobName: this.name,
        executedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Executa atualização forçada (ignora horário e dia da semana)
   * @returns {Promise<Object>}
   */
  async forceExecute() {
    const executionId = Date.now();
    
    console.log(`\n🔧 [${this.name}] Execução FORÇADA #${executionId}`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
    
    try {
      const result = await quotationService.updateAllQuotes();
      
      console.log(`✅ [${this.name}] Execução forçada #${executionId} concluída`);
      
      return {
        ...result,
        executionId,
        jobName: this.name,
        forced: true,
        executedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [${this.name}] Erro na execução forçada #${executionId}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        executionId,
        jobName: this.name,
        forced: true,
        executedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Retorna informações sobre o job
   * @returns {Object}
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      schedule: '0 19 * * 1-5', // Cron: 19h, segunda a sexta
      timezone: 'America/Sao_Paulo'
    };
  }

  /**
   * Verifica se deve executar baseado em horário e dia
   * @returns {Object}
   */
  shouldExecute() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isAfterClose = hour >= 19;
    
    return {
      should: isWeekday && isAfterClose,
      isWeekday,
      isAfterClose,
      currentDay: dayOfWeek,
      currentHour: hour,
      reason: !isWeekday ? 'Fim de semana' : 
              !isAfterClose ? 'Antes do fechamento da bolsa' : 
              'Condições adequadas'
    };
  }
}

module.exports = new DailyQuotationJob();