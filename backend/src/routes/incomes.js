const express = require('express');
const IncomeController = require('../controllers/incomeController');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/connection');

const router = express.Router();

// Middleware para conectar ao banco
router.use(async (req, res, next) => {
  try {
    if (!db.db) {
      await db.connect();
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro de conexão com banco' });
  }
});

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas de relatórios (devem vir antes das rotas com parâmetros)
router.get('/totals/:mes/:ano', IncomeController.getTotalByMonth);
router.get('/categories/:mes/:ano', IncomeController.getByCategory);
router.get('/group', IncomeController.getGroupByDescription);

// Rotas CRUD
router.post('/', IncomeController.create);
router.get('/', IncomeController.getAll);
router.get('/:id', IncomeController.getById);
router.put('/:id', IncomeController.update);
router.delete('/:id', IncomeController.delete);

module.exports = router;