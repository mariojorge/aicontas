const express = require('express');
const router = express.Router();
const investmentTransactionController = require('../controllers/investmentTransactionController');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

router.get('/portfolio', investmentTransactionController.getPortfolioSummary);
router.get('/', investmentTransactionController.getAll);
router.get('/:id', investmentTransactionController.getById);
router.post('/', investmentTransactionController.create);
router.put('/:id', investmentTransactionController.update);
router.delete('/:id', investmentTransactionController.delete);

module.exports = router;