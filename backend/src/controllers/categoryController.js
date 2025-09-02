const Category = require('../models/category');

const categoryController = {
  async getAll(req, res) {
    try {
      const categories = await Category.findAll({ ...req.query, user_id: req.user.id });
      res.json({
        success: true,
        data: categories,
        total: categories.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar categorias',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const category = await Category.findById(req.params.id, req.user.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar categoria',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const category = await Category.create({ ...req.body, user_id: req.user.id });
      
      res.status(201).json({
        success: true,
        data: category,
        message: 'Categoria criada com sucesso'
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
        message: 'Erro ao criar categoria',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const category = await Category.update(req.params.id, req.body, req.user.id);
      
      res.json({
        success: true,
        data: category,
        message: 'Categoria atualizada com sucesso'
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          error: error.message
        });
      }

      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar categoria',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      await Category.delete(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: 'Categoria excluída com sucesso'
      });
    } catch (error) {
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('está sendo utilizada')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao excluir categoria',
        error: error.message
      });
    }
  },

  async toggleActive(req, res) {
    try {
      const result = await Category.toggleActive(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status da categoria',
        error: error.message
      });
    }
  }
};

module.exports = categoryController;