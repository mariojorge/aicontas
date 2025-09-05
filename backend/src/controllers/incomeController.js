const Income = require('../models/income');
const { parseLocalDate, formatDateToString } = require('../utils/dateHelper');

class IncomeController {
  static async create(req, res) {
    try {
      console.log('💰 Criando receita:', req.body);
      const incomeData = { ...req.body, user_id: req.user.id };
      
      // Se for parcelado, criar múltiplos lançamentos
      if (incomeData.repetir === 'parcelado' && incomeData.parcelas > 1) {
        const incomes = [];
        const baseDate = parseLocalDate(incomeData.data_recebimento);
        const groupId = Income.generateGroupId(); // Gerar group_id único para o grupo
        
        for (let i = 1; i <= incomeData.parcelas; i++) {
          const parcelaDate = new Date(baseDate);
          // Preserva o dia original ao adicionar meses
          const targetMonth = baseDate.getMonth() + (i - 1);
          const targetYear = baseDate.getFullYear() + Math.floor(targetMonth / 12);
          const finalMonth = targetMonth % 12;
          const lastDayOfTargetMonth = new Date(targetYear, finalMonth + 1, 0).getDate();
          const dayToSet = Math.min(baseDate.getDate(), lastDayOfTargetMonth);
          parcelaDate.setFullYear(targetYear, finalMonth, dayToSet);
          
          const parcelaData = {
            ...incomeData,
            descricao: `${incomeData.descricao} (${i}/${incomeData.parcelas})`,
            data_recebimento: formatDateToString(parcelaDate),
            parcela_atual: i,
            group_id: groupId // Usar o mesmo group_id para todas as parcelas
          };
          
          const income = await Income.create(parcelaData);
          incomes.push(income);
        }
        
        console.log(`✅ ${incomes.length} parcelas criadas com group_id: ${groupId}`);
        return res.status(201).json({ success: true, data: incomes });
      }
      
      // Se for fixo mensal, criar lançamentos até dezembro do ano atual
      if (incomeData.repetir === 'fixo') {
        const incomes = [];
        const baseDate = parseLocalDate(incomeData.data_recebimento);
        const currentYear = new Date().getFullYear();
        const startMonth = baseDate.getMonth();
        const endMonth = 11; // Dezembro (0-based)
        const groupId = Income.generateGroupId(); // Gerar group_id único para o grupo
        
        for (let month = startMonth; month <= endMonth; month++) {
          // Preserva o dia original, ajustando para o último dia do mês se necessário
          const lastDayOfMonth = new Date(currentYear, month + 1, 0).getDate();
          const dayToSet = Math.min(baseDate.getDate(), lastDayOfMonth);
          const fixaDate = new Date(currentYear, month, dayToSet);
          
          const fixaData = {
            ...incomeData,
            data_recebimento: formatDateToString(fixaDate),
            parcela_atual: 1,
            group_id: groupId // Usar o mesmo group_id para todos os lançamentos fixos
          };
          
          const income = await Income.create(fixaData);
          incomes.push(income);
        }
        
        console.log(`✅ ${incomes.length} lançamentos fixos criados até dezembro com group_id: ${groupId}`);
        return res.status(201).json({ success: true, data: incomes });
      }
      
      // Lançamento único - corrigir data antes de salvar
      const processedData = {
        ...incomeData,
        data_recebimento: formatDateToString(parseLocalDate(incomeData.data_recebimento))
      };
      const income = await Income.create(processedData);
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
        ano: req.query.ano,
        user_id: req.user.id
      };

      const incomes = await Income.findAll(filters);
      res.json({ success: true, data: incomes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const income = await Income.findById(req.params.id, req.user.id);
      
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
      
      const currentIncome = await Income.findById(req.params.id, req.user.id);
      if (!currentIncome) {
        return res.status(404).json({ success: false, error: 'Receita não encontrada' });
      }
      
      // Se a receita tem recorrência e o updateAll está definido
      if (currentIncome.repetir !== 'nao' && req.body.updateAll !== undefined) {
        const { updateAll, ...updateData } = req.body;
        
        // Processar data se existir
        if (updateData.data_recebimento) {
          updateData.data_recebimento = formatDateToString(parseLocalDate(updateData.data_recebimento));
        }
        
        if (updateAll) {
          // Atualizar todas as receitas abertas do grupo
          await Income.updateGroup(currentIncome.descricao, currentIncome.repetir, updateData, true, req.user.id);
          
          // Buscar receitas atualizadas para retornar
          const updatedIncomes = await Income.findByGroup(currentIncome.descricao, currentIncome.repetir, req.user.id);
          console.log(`✅ ${updatedIncomes.filter(i => i.situacao === 'aberto').length} receitas do grupo atualizadas`);
          
          return res.json({ success: true, data: updatedIncomes, updated_count: updatedIncomes.filter(i => i.situacao === 'aberto').length });
        }
      }
      
      // Atualizar apenas o lançamento atual
      const { updateAll, ...updateData } = req.body;
      
      // Processar data se existir
      if (updateData.data_recebimento) {
        updateData.data_recebimento = formatDateToString(parseLocalDate(updateData.data_recebimento));
      }
      
      const income = await Income.update(req.params.id, updateData, req.user.id);
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
      const result = await Income.delete(req.params.id, req.user.id);
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
      const totals = await Income.getTotalByMonth(mes, ano, req.user.id);
      res.json({ success: true, data: totals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByCategory(req, res) {
    try {
      const { mes, ano } = req.params;
      const { situacao } = req.query;
      const categories = await Income.getByCategory(mes, ano, situacao, req.user.id);
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getGroupByDescription(req, res) {
    try {
      const { descricao, repetir, group_id } = req.query;
      
      // Se group_id foi fornecido, usar o novo método
      if (group_id) {
        const groupItems = await Income.findByGroupId(group_id, req.user.id);
        return res.json({ success: true, data: groupItems });
      }
      
      // Método legado usando descrição e repetir
      if (!descricao || !repetir) {
        return res.status(400).json({ 
          success: false, 
          error: 'Parâmetros descricao e repetir são obrigatórios (ou use group_id)' 
        });
      }

      const groupItems = await Income.findByGroup(descricao, repetir, req.user.id);
      res.json({ success: true, data: groupItems });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = IncomeController;