const db = require('../database/connection');
const yup = require('yup');

const categorySchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tipo: yup.string().oneOf(['receita', 'despesa'], 'Tipo deve ser "receita" ou "despesa"').required('Tipo é obrigatório'),
  ativo: yup.boolean().optional()
});

class Category {
  static async create(data) {
    await categorySchema.validate(data);
    
    const {
      nome,
      tipo,
      ativo = true
    } = data;

    const result = await db.run(`
      INSERT INTO categories (nome, tipo, ativo) 
      VALUES (?, ?, ?)
    `, [nome, tipo, ativo]);

    return { id: result.id, ...data };
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM expenses WHERE categoria = c.nome) + 
        (SELECT COUNT(*) FROM incomes WHERE categoria = c.nome) as usage_count
      FROM categories c 
      WHERE 1=1
    `;
    const params = [];

    if (filters.tipo) {
      sql += ' AND c.tipo = ?';
      params.push(filters.tipo);
    }

    if (filters.ativo !== undefined) {
      sql += ' AND c.ativo = ?';
      params.push(filters.ativo);
    }

    sql += ' ORDER BY c.tipo, c.nome';

    return await db.all(sql, params);
  }

  static async findById(id) {
    return await db.get('SELECT * FROM categories WHERE id = ?', [id]);
  }

  static async update(id, data) {
    const updateSchema = categorySchema.partial();
    await updateSchema.validate(data);

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const result = await db.run(`
      UPDATE categories SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);

    if (result.changes === 0) {
      throw new Error('Categoria não encontrada');
    }

    return await this.findById(id);
  }

  static async delete(id) {
    // Verificar se a categoria está sendo usada
    const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses WHERE categoria = (SELECT nome FROM categories WHERE id = ?)', [id]);
    const incomeCount = await db.get('SELECT COUNT(*) as count FROM incomes WHERE categoria = (SELECT nome FROM categories WHERE id = ?)', [id]);
    
    if (expenseCount.count > 0 || incomeCount.count > 0) {
      throw new Error('Categoria não pode ser excluída pois está sendo utilizada');
    }

    const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      throw new Error('Categoria não encontrada');
    }

    return { message: 'Categoria excluída com sucesso' };
  }

  static async toggleActive(id) {
    const category = await this.findById(id);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    const newStatus = !category.ativo;
    await this.update(id, { ativo: newStatus });
    
    return { message: `Categoria ${newStatus ? 'ativada' : 'desativada'} com sucesso` };
  }
}

module.exports = Category;