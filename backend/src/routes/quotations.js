const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /quotations/status - Status das cotações
router.get('/status', quotationController.getStatus);

// GET /quotations/outdated - Ativos com cotações desatualizadas
router.get('/outdated', quotationController.getOutdatedAssets);

// POST /quotations/update - Atualizar todas as cotações manualmente
router.post('/update', quotationController.updateAll);

// POST /quotations/update/:ticker - Atualizar cotação de um ativo específico
router.post('/update/:ticker', quotationController.updateAsset);

// POST /quotations/run-job - Executar job de cotações manualmente
router.post('/run-job', quotationController.runJob);

// GET /quotations/live/:ticker - Buscar cotação em tempo real (sem salvar)
router.get('/live/:ticker', quotationController.getLiveQuote);

module.exports = router;