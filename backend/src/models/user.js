const db = require('../database/connection');
const yup = require('yup');
const bcrypt = require('bcryptjs');

const userSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória')
});

const loginSchema = yup.object().shape({
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().required('Senha é obrigatória')
});

class User {
  static async create(data) {
    await userSchema.validate(data);
    
    const { nome, email, password } = data;
    
    // Verificar se o e-mail já existe
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new Error('E-mail já está em uso');
    }
    
    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await db.run(`
      INSERT INTO users (nome, email, password_hash)
      VALUES (?, ?, ?)
    `, [nome, email, password_hash]);

    return { 
      id: result.id, 
      nome, 
      email,
      created_at: new Date().toISOString()
    };
  }

  static async findByEmail(email) {
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    const user = await db.get('SELECT id, nome, email, created_at, updated_at FROM users WHERE id = ?', [id]);
    return user;
  }

  static async validateLogin(data) {
    await loginSchema.validate(data);
    
    const { email, password } = data;
    
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }
    
    // Retornar usuário sem a senha
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  static async update(id, data) {
    const allowedFields = ['nome'];
    const updates = {};
    
    // Filtrar apenas campos permitidos
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = data[key];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }
    
    // Validar dados
    const updateSchema = yup.object().shape({
      nome: yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres')
    });
    
    await updateSchema.validate(updates);
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), new Date().toISOString(), id];
    
    await db.run(`
      UPDATE users 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `, values);

    return await this.findById(id);
  }

  static async changePassword(id, currentPassword, newPassword) {
    // Validar nova senha
    const passwordSchema = yup.object().shape({
      newPassword: yup.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres').required()
    });
    
    await passwordSchema.validate({ newPassword });
    
    // Buscar usuário com senha atual
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }
    
    // Hash da nova senha
    const password_hash = await bcrypt.hash(newPassword, 10);
    
    await db.run(`
      UPDATE users 
      SET password_hash = ?, updated_at = ?
      WHERE id = ?
    `, [password_hash, new Date().toISOString(), id]);

    return { success: true, message: 'Senha alterada com sucesso' };
  }
}

module.exports = User;