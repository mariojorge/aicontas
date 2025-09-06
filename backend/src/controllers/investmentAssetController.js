const InvestmentAsset = require('../models/investmentAsset');

const investmentAssetController = {
  async getAll(req, res) {
    try {
      const assets = await InvestmentAsset.findAll({ ...req.query, user_id: req.user.id });
      res.json({
        success: true,
        data: assets,
        total: assets.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar ativos de investimento',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const asset = await InvestmentAsset.findById(req.params.id, req.user.id);
      
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Ativo de investimento não encontrado'
        });
      }

      res.json({
        success: true,
        data: asset
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar ativo de investimento',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Usuário não identificado',
          error: 'user_id é obrigatório'
        });
      }
      
      const asset = await InvestmentAsset.create({ ...req.body, user_id: req.user.id });
      
      res.status(201).json({
        success: true,
        data: asset,
        message: 'Ativo de investimento criado com sucesso'
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
        message: 'Erro ao criar ativo de investimento',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const asset = await InvestmentAsset.update(req.params.id, req.body, req.user.id);
      
      res.json({
        success: true,
        data: asset,
        message: 'Ativo de investimento atualizado com sucesso'
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: 'Ativo de investimento não encontrado'
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
        message: 'Erro ao atualizar ativo de investimento',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      await InvestmentAsset.delete(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: 'Ativo de investimento excluído com sucesso'
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: 'Ativo de investimento não encontrado'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao excluir ativo de investimento',
        error: error.message
      });
    }
  },

  async toggleActive(req, res) {
    try {
      const asset = await InvestmentAsset.toggleActive(req.params.id, req.user.id);
      
      res.json({
        success: true,
        data: asset,
        message: `Ativo de investimento ${asset.ativo ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          message: 'Ativo de investimento não encontrado'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do ativo de investimento',
        error: error.message
      });
    }
  }
};

module.exports = investmentAssetController;