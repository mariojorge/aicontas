const db = require('../database/connection');
const yup = require('yup');

const creditCardSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  bandeira: yup.string().required('Bandeira é obrigatória'),
  melhor_dia_compra: yup.number()
    .integer('Melhor dia deve ser um número inteiro')
    .min(1, 'Melhor dia deve ser entre 1 e 31')
    .max(31, 'Melhor dia deve ser entre 1 e 31')
    .required('Melhor dia para compra é obrigatório'),
  ativo: yup.boolean().optional()
});

class CreditCard {
  static async create(data) {
    await creditCardSchema.validate(data);
    
    const {
      nome,
      bandeira,
      melhor_dia_compra,
      ativo = true,
      user_id
    } = data;

    const result = await db.run(`
      INSERT INTO credit_cards (nome, bandeira, melhor_dia_compra, ativo, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `, [nome, bandeira, melhor_dia_compra, ativo, user_id]);

    return { id: result.id, ...data };
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM credit_cards WHERE user_id = ?';
    const params = [filters.user_id];

    if (filters.ativo !== undefined) {
      sql += ' AND ativo = ?';
      params.push(filters.ativo);
    }

    sql += ' ORDER BY nome';

    return await db.all(sql, params);
  }

  static async findById(id, userId) {
    return await db.get('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async update(id, data, userId) {
    const updateSchema = creditCardSchema.partial();
    await updateSchema.validate(data);

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id, userId);

    const result = await db.run(`
      UPDATE credit_cards SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `, values);

    if (result.changes === 0) {
      throw new Error('Cartão não encontrado');
    }

    return await this.findById(id, userId);
  }

  static async delete(id, userId) {
    // Aqui futuramente podemos verificar se o cartão está sendo usado em lançamentos
    const result = await db.run('DELETE FROM credit_cards WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.changes === 0) {
      throw new Error('Cartão não encontrado');
    }

    return { message: 'Cartão excluído com sucesso' };
  }

  static async toggleActive(id, userId) {
    const card = await this.findById(id, userId);
    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    const newStatus = !card.ativo;
    await this.update(id, { ativo: newStatus }, userId);
    
    return { message: `Cartão ${newStatus ? 'ativado' : 'desativado'} com sucesso` };
  }
}

module.exports = CreditCard;