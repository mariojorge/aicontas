const InvestmentTransaction = require('../models/investmentTransaction');

const investmentTransactionController = {
  async getAll(req, res) {
    try {
      const transactions = await InvestmentTransaction.findAll({ ...req.query, user_id: req.user.id });
      res.json({
        success: true,
        data: transactions,
        total: transactions.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar transações de investimento',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const transaction = await InvestmentTransaction.findById(req.params.id, req.user.id);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar transação',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const transaction = await InvestmentTransaction.create({ ...req.body, user_id: req.user.id });
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transação criada com sucesso'
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar transação',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const transaction = await InvestmentTransaction.update(req.params.id, req.body, req.user.id);
      
      res.json({
        success: true,
        data: transaction,
        message: 'Transação atualizada com sucesso'
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar transação',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      await InvestmentTransaction.delete(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: 'Transação excluída com sucesso'
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao excluir transação',
        error: error.message
      });
    }
  },

  async getPortfolioSummary(req, res) {
    try {
      const portfolio = await InvestmentTransaction.getPortfolioSummary(req.user.id);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar resumo da carteira',
        error: error.message
      });
    }
  }
};

module.exports = investmentTransactionController;