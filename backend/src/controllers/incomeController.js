const Income = require('../models/income');

class IncomeController {
  static async create(req, res) {
    try {
      console.log('💰 Criando receita:', req.body);
      const incomeData = req.body;
      
      // Se for parcelado, criar múltiplos lançamentos
      if (incomeData.repetir === 'parcelado' && incomeData.parcelas > 1) {
        const incomes = [];
        const baseDate = new Date(incomeData.data_recebimento);
        
        for (let i = 1; i <= incomeData.parcelas; i++) {
          const parcelaDate = new Date(baseDate);
          parcelaDate.setMonth(baseDate.getMonth() + (i - 1));
          
          const parcelaData = {
            ...incomeData,
            descricao: `${incomeData.descricao} (${i}/${incomeData.parcelas})`,
            data_recebimento: parcelaDate.toISOString().split('T')[0],
            parcela_atual: i
          };
          
          const income = await Income.create(parcelaData);
          incomes.push(income);
        }
        
        console.log(`✅ ${incomes.length} parcelas criadas`);
        return res.status(201).json({ success: true, data: incomes });
      }
      
      // Se for fixo mensal, criar lançamentos até dezembro do ano atual
      if (incomeData.repetir === 'fixo') {
        const incomes = [];
        const baseDate = new Date(incomeData.data_recebimento);
        const currentYear = new Date().getFullYear();
        const startMonth = baseDate.getMonth();
        const endMonth = 11; // Dezembro (0-based)
        
        for (let month = startMonth; month <= endMonth; month++) {
          const fixaDate = new Date(currentYear, month, baseDate.getDate());
          
          const fixaData = {
            ...incomeData,
            data_recebimento: fixaDate.toISOString().split('T')[0],
            parcela_atual: 1
          };
          
          const income = await Income.create(fixaData);
          incomes.push(income);
        }
        
        console.log(`✅ ${incomes.length} lançamentos fixos criados até dezembro`);
        return res.status(201).json({ success: true, data: incomes });
      }
      
      // Lançamento único
      const income = await Income.create(incomeData);
      console.log('✅ Receita criada:', income);
      res.status(201).json({ success: true, data: income });
    } catch (error) {
      console.error('❌ Erro ao criar receita:', error.message);
      console.error('📋 Dados recebidos:', req.body);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const filters = {
        situacao: req.query.situacao,
        categoria: req.query.categoria,
        mes: req.query.mes,
        ano: req.query.ano
      };

      const incomes = await Income.findAll(filters);
      res.json({ success: true, data: incomes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const income = await Income.findById(req.params.id);
      
      if (!income) {
        return res.status(404).json({ success: false, error: 'Receita não encontrada' });
      }

      res.json({ success: true, data: income });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      console.log('📝 Atualizando receita ID:', req.params.id);
      console.log('📋 Dados para atualizar:', req.body);
      
      const currentIncome = await Income.findById(req.params.id);
      if (!currentIncome) {
        return res.status(404).json({ success: false, error: 'Receita não encontrada' });
      }
      
      // Se a receita tem recorrência e o updateAll está definido
      if (currentIncome.repetir !== 'nao' && req.body.updateAll !== undefined) {
        const { updateAll, ...updateData } = req.body;
        
        if (updateAll) {
          // Atualizar todas as receitas abertas do grupo
          await Income.updateGroup(currentIncome.descricao, currentIncome.repetir, updateData, true);
          
          // Buscar receitas atualizadas para retornar
          const updatedIncomes = await Income.findByGroup(currentIncome.descricao, currentIncome.repetir);
          console.log(`✅ ${updatedIncomes.filter(i => i.situacao === 'aberto').length} receitas do grupo atualizadas`);
          
          return res.json({ success: true, data: updatedIncomes, updated_count: updatedIncomes.filter(i => i.situacao === 'aberto').length });
        }
      }
      
      // Atualizar apenas o lançamento atual
      const { updateAll, ...updateData } = req.body;
      const income = await Income.update(req.params.id, updateData);
      console.log('✅ Receita atualizada:', income);
      res.json({ success: true, data: income });
    } catch (error) {
      console.error('❌ Erro ao atualizar receita:', error.message);
      console.error('📋 Dados recebidos:', req.body);
      if (error.message === 'Receita não encontrada') {
        return res.status(404).json({ success: false, error: error.message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await Income.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      if (error.message === 'Receita não encontrada') {
        return res.status(404).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTotalByMonth(req, res) {
    try {
      const { mes, ano } = req.params;
      const totals = await Income.getTotalByMonth(mes, ano);
      res.json({ success: true, data: totals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByCategory(req, res) {
    try {
      const { mes, ano } = req.params;
      const { situacao } = req.query;
      const categories = await Income.getByCategory(mes, ano, situacao);
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = IncomeController;