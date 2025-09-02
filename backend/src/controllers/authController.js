const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'finance_control_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

class AuthController {
  static async register(req, res) {
    try {
      console.log('👤 Registrando novo usuário:', req.body.email);
      
      const user = await User.create(req.body);
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      console.log('✅ Usuário registrado com sucesso:', user.email);
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('❌ Erro ao registrar usuário:', error.message);
      
      if (error.message === 'E-mail já está em uso') {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      console.log('🔐 Tentativa de login:', req.body.email);
      
      const user = await User.validateLogin(req.body);
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      console.log('✅ Login realizado com sucesso:', user.email);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async me(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      console.log('👤 Atualizando perfil do usuário:', req.user.id);
      
      const user = await User.update(req.user.id, req.body);
      
      console.log('✅ Perfil atualizado com sucesso');
      
      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error.message);
      
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async changePassword(req, res) {
    try {
      console.log('🔒 Alterando senha do usuário:', req.user.id);
      
      const { currentPassword, newPassword } = req.body;
      
      const result = await User.changePassword(req.user.id, currentPassword, newPassword);
      
      console.log('✅ Senha alterada com sucesso');
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error.message);
      
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async validateToken(req, res) {
    try {
      // Se chegou até aqui, o token é válido (middleware já validou)
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
      
      res.json({
        success: true,
        valid: true,
        data: user
      });
    } catch (error) {
      console.error('❌ Erro ao validar token:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async logout(req, res) {
    try {
      // No JWT, o logout é feito no frontend removendo o token
      // Aqui podemos apenas logar a ação
      console.log('👋 Logout realizado:', req.user.email);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro no logout:', error.message);
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AuthController;