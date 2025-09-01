const CreditCard = require('../models/creditCard');

const creditCardController = {
  async getAll(req, res) {
    try {
      const cards = await CreditCard.findAll(req.query);
      res.json({
        success: true,
        data: cards,
        total: cards.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar cartões',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const card = await CreditCard.findById(req.params.id);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Cartão não encontrado'
        });
      }

      res.json({
        success: true,
        data: card
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar cartão',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const card = await CreditCard.create(req.body);
      
      res.status(201).json({
        success: true,
        data: card,
        message: 'Cartão criado com sucesso'
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
        message: 'Erro ao criar cartão',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const card = await CreditCard.update(req.params.id, req.body);
      
      res.json({
        success: true,
        data: card,
        message: 'Cartão atualizado com sucesso'
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          error: error.message
        });
      }

      if (error.message === 'Cartão não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar cartão',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      await CreditCard.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Cartão excluído com sucesso'
      });
    } catch (error) {
      if (error.message === 'Cartão não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao excluir cartão',
        error: error.message
      });
    }
  },

  async toggleActive(req, res) {
    try {
      const result = await CreditCard.toggleActive(req.params.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'Cartão não encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do cartão',
        error: error.message
      });
    }
  }
};

module.exports = creditCardController;