const express = require('express');
const ExpenseController = require('../controllers/expenseController');
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
router.get('/totals/:mes/:ano', ExpenseController.getTotalByMonth);
router.get('/categories/:mes/:ano', ExpenseController.getByCategory);
router.get('/grouped', ExpenseController.getAllGrouped);
router.get('/group', ExpenseController.getGroupByDescription);
router.patch('/credit-card/:cardId/toggle-payment', ExpenseController.toggleCreditCardPayments);

// Rotas CRUD
router.post('/', ExpenseController.create);
router.get('/', ExpenseController.getAll);
router.get('/:id', ExpenseController.getById);
router.put('/:id', ExpenseController.update);
router.delete('/:id', ExpenseController.delete);

module.exports = router;