const express = require('express');
const router = express.Router();
const investmentAssetController = require('../controllers/investmentAssetController');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

router.get('/', investmentAssetController.getAll);
router.get('/:id', investmentAssetController.getById);
router.post('/', investmentAssetController.create);
router.put('/:id', investmentAssetController.update);
router.delete('/:id', investmentAssetController.delete);
router.patch('/:id/toggle-active', investmentAssetController.toggleActive);

module.exports = router;