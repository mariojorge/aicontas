const Expense = require('../models/expense');
const { parseLocalDate, formatDateToString } = require('../utils/dateHelper');

class ExpenseController {
  static async create(req, res) {
    try {
      console.log('📝 Criando despesa:', req.body);
      const expenseData = { ...req.body, user_id: req.user.id };
      
      // Se for parcelado, criar múltiplos lançamentos
      if (expenseData.repetir === 'parcelado' && expenseData.parcelas > 1) {
        const expenses = [];
        const baseDate = parseLocalDate(expenseData.data_pagamento);
        const groupId = Expense.generateGroupId(); // Gerar group_id único para o grupo
        
        for (let i = 1; i <= expenseData.parcelas; i++) {
          const parcelaDate = new Date(baseDate);
          // Preserva o dia original ao adicionar meses
          const targetMonth = baseDate.getMonth() + (i - 1);
          const targetYear = baseDate.getFullYear() + Math.floor(targetMonth / 12);
          const finalMonth = targetMonth % 12;
          const lastDayOfTargetMonth = new Date(targetYear, finalMonth + 1, 0).getDate();
          const dayToSet = Math.min(baseDate.getDate(), lastDayOfTargetMonth);
          parcelaDate.setFullYear(targetYear, finalMonth, dayToSet);
          
          const parcelaData = {
            ...expenseData,
            descricao: `${expenseData.descricao} (${i}/${expenseData.parcelas})`,
            data_pagamento: formatDateToString(parcelaDate),
            parcela_atual: i,
            group_id: groupId // Usar o mesmo group_id para todas as parcelas
          };
          
          const expense = await Expense.create(parcelaData);
          expenses.push(expense);
        }
        
        console.log(`✅ ${expenses.length} parcelas criadas com group_id: ${groupId}`);
        return res.status(201).json({ success: true, data: expenses });
      }
      
      // Se for fixo mensal, criar lançamentos até dezembro do ano atual
      if (expenseData.repetir === 'fixo') {
        const expenses = [];
        const baseDate = parseLocalDate(expenseData.data_pagamento);
        const currentYear = new Date().getFullYear();
        const startMonth = baseDate.getMonth();
        const endMonth = 11; // Dezembro (0-based)
        const groupId = Expense.generateGroupId(); // Gerar group_id único para o grupo
        
        for (let month = startMonth; month <= endMonth; month++) {
          // Preserva o dia original, ajustando para o último dia do mês se necessário
          const lastDayOfMonth = new Date(currentYear, month + 1, 0).getDate();
          const dayToSet = Math.min(baseDate.getDate(), lastDayOfMonth);
          const fixaDate = new Date(currentYear, month, dayToSet);
          
          const fixaData = {
            ...expenseData,
            data_pagamento: formatDateToString(fixaDate),
            parcela_atual: 1,
            group_id: groupId // Usar o mesmo group_id para todos os lançamentos fixos
          };
          
          const expense = await Expense.create(fixaData);
          expenses.push(expense);
        }
        
        console.log(`✅ ${expenses.length} lançamentos fixos criados até dezembro com group_id: ${groupId}`);
        return res.status(201).json({ success: true, data: expenses });
      }
      
      // Lançamento único - corrigir data antes de salvar
      const processedData = {
        ...expenseData,
        data_pagamento: formatDateToString(parseLocalDate(expenseData.data_pagamento))
      };
      
      const expense = await Expense.create(processedData);
      console.log('✅ Despesa criada:', expense);
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      console.error('❌ Erro ao criar despesa:', error.message);
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

      const expenses = await Expense.findAll(filters);
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const expense = await Expense.findById(req.params.id, req.user.id);
      
      if (!expense) {
        return res.status(404).json({ success: false, error: 'Despesa não encontrada' });
      }

      res.json({ success: true, data: expense });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      console.log('📝 Atualizando despesa ID:', req.params.id);
      console.log('📋 Dados para atualizar:', req.body);
      
      const currentExpense = await Expense.findById(req.params.id, req.user.id);
      if (!currentExpense) {
        return res.status(404).json({ success: false, error: 'Despesa não encontrada' });
      }
      
      // Se a despesa tem recorrência e o updateAll está definido
      if (currentExpense.repetir !== 'nao' && req.body.updateAll !== undefined) {
        const { updateAll, ...updateData } = req.body;
        
        // Processar data se existir
        if (updateData.data_pagamento) {
          updateData.data_pagamento = formatDateToString(parseLocalDate(updateData.data_pagamento));
        }
        
        if (updateAll) {
          // Atualizar todos os lançamentos abertos do grupo
          await Expense.updateGroup(currentExpense.descricao, currentExpense.repetir, updateData, true, req.user.id);
          
          // Buscar lançamentos atualizados para retornar
          const updatedExpenses = await Expense.findByGroup(currentExpense.descricao, currentExpense.repetir, req.user.id);
          console.log(`✅ ${updatedExpenses.filter(e => e.situacao === 'aberto').length} despesas do grupo atualizadas`);
          
          return res.json({ success: true, data: updatedExpenses, updated_count: updatedExpenses.filter(e => e.situacao === 'aberto').length });
        }
      }
      
      // Atualizar apenas o lançamento atual
      const { updateAll, ...updateData } = req.body;
      
      // Processar data se existir
      if (updateData.data_pagamento) {
        updateData.data_pagamento = formatDateToString(parseLocalDate(updateData.data_pagamento));
      }
      
      const expense = await Expense.update(req.params.id, updateData, req.user.id);
      console.log('✅ Despesa atualizada:', expense);
      res.json({ success: true, data: expense });
    } catch (error) {
      console.error('❌ Erro ao atualizar despesa:', error.message);
      console.error('📋 Dados recebidos:', req.body);
      if (error.message === 'Despesa não encontrada') {
        return res.status(404).json({ success: false, error: error.message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await Expense.delete(req.params.id, req.user.id);
      res.json({ success: true, ...result });
    } catch (error) {
      if (error.message === 'Despesa não encontrada') {
        return res.status(404).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTotalByMonth(req, res) {
    try {
      const { mes, ano } = req.params;
      const totals = await Expense.getTotalByMonth(mes, ano, req.user.id);
      res.json({ success: true, data: totals });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByCategory(req, res) {
    try {
      const { mes, ano } = req.params;
      const { situacao } = req.query;
      const categories = await Expense.getByCategory(mes, ano, situacao, req.user.id);
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllGrouped(req, res) {
    try {
      const grouped = await Expense.findAllGroupedByCard({ ...req.query, user_id: req.user.id });
      
      res.json({
        success: true,
        data: grouped
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar despesas agrupadas',
        error: error.message
      });
    }
  }

  static async getGroupByDescription(req, res) {
    try {
      const { descricao, repetir, group_id } = req.query;
      
      // Se group_id foi fornecido, usar o novo método
      if (group_id) {
        const groupItems = await Expense.findByGroupId(group_id, req.user.id);
        return res.json({ success: true, data: groupItems });
      }
      
      // Método legado usando descrição e repetir
      if (!descricao || !repetir) {
        return res.status(400).json({ 
          success: false, 
          error: 'Parâmetros descricao e repetir são obrigatórios (ou use group_id)' 
        });
      }

      const groupItems = await Expense.findByGroup(descricao, repetir, req.user.id);
      res.json({ success: true, data: groupItems });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ExpenseController;