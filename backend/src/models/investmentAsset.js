const db = require('../database/connection');
const yup = require('yup');

const investmentAssetSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tipo: yup.string().oneOf(['acao', 'fii', 'fundo', 'renda_fixa', 'etf'], 'Tipo deve ser "acao", "fii", "fundo", "renda_fixa" ou "etf"').required('Tipo é obrigatório'),
  setor: yup.string().optional(),
  descricao: yup.string().optional(),
  ativo: yup.boolean().optional()
});

class InvestmentAsset {
  static async create(data) {
    await investmentAssetSchema.validate(data);
    
    const {
      nome,
      tipo,
      setor = null,
      descricao = null,
      ativo = true,
      user_id
    } = data;

    const result = await db.run(`
      INSERT INTO investment_assets (nome, tipo, setor, descricao, ativo, user_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nome, tipo, setor, descricao, ativo, user_id]);

    return { id: result.id, ...data };
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT * FROM investment_assets 
      WHERE user_id = ?
    `;
    const params = [filters.user_id];

    if (filters.tipo) {
      sql += ' AND tipo = ?';
      params.push(filters.tipo);
    }

    if (filters.ativo !== undefined) {
      sql += ' AND ativo = ?';
      params.push(filters.ativo);
    }

    if (filters.search) {
      sql += ' AND (nome LIKE ? OR setor LIKE ?)';
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam);
    }

    sql += ' ORDER BY tipo, nome';

    return await db.all(sql, params);
  }

  static async findById(id, userId) {
    return await db.get('SELECT * FROM investment_assets WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async update(id, data, userId) {
    const updateSchema = investmentAssetSchema.partial();
    await updateSchema.validate(data);

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id, userId);

    const result = await db.run(`
      UPDATE investment_assets SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `, values);

    if (result.changes === 0) {
      const error = new Error('Ativo de investimento não encontrado');
      error.name = 'NotFoundError';
      throw error;
    }

    return await this.findById(id, userId);
  }

  static async delete(id, userId) {
    const result = await db.run('DELETE FROM investment_assets WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.changes === 0) {
      const error = new Error('Ativo de investimento não encontrado');
      error.name = 'NotFoundError';
      throw error;
    }

    return { message: 'Ativo de investimento excluído com sucesso' };
  }

  static async toggleActive(id, userId) {
    const asset = await this.findById(id, userId);
    if (!asset) {
      const error = new Error('Ativo de investimento não encontrado');
      error.name = 'NotFoundError';
      throw error;
    }

    const newActiveStatus = !asset.ativo;
    
    await db.run(`
      UPDATE investment_assets SET ativo = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `, [newActiveStatus, id, userId]);

    return await this.findById(id, userId);
  }
}

module.exports = InvestmentAsset;