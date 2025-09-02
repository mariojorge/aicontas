const express = require('express');
const AuthController = require('../controllers/authController');
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

// Rotas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rotas protegidas (requerem autenticação)
router.get('/me', authenticateToken, AuthController.me);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);
router.get('/validate', authenticateToken, AuthController.validateToken);
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;