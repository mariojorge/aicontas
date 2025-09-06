const db = require('../database/connection');
const yup = require('yup');

const investmentTransactionSchema = yup.object().shape({
  asset_id: yup.number().required('Ativo é obrigatório').integer().positive(),
  data: yup.date().required('Data é obrigatória'),
  tipo: yup.string().oneOf(['compra', 'venda', 'dividendos'], 'Tipo deve ser "compra", "venda" ou "dividendos"').required('Tipo é obrigatório'),
  quantidade: yup.number().required('Quantidade é obrigatória').positive('Quantidade deve ser positiva'),
  valor_unitario: yup.number().required('Valor unitário é obrigatório').positive('Valor unitário deve ser positivo'),
  valor_total: yup.number().optional()
});

class InvestmentTransaction {
  static async create(data) {
    await investmentTransactionSchema.validate(data);
    
    const {
      asset_id,
      data: transactionDate,
      tipo,
      quantidade,
      valor_unitario,
      user_id
    } = data;

    // Calcular valor total automaticamente
    const valor_total = quantidade * valor_unitario;

    const result = await db.run(`
      INSERT INTO investment_transactions (asset_id, data, tipo, quantidade, valor_unitario, valor_total, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [asset_id, transactionDate, tipo, quantidade, valor_unitario, valor_total, user_id]);

    return { id: result.id, ...data, valor_total };
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        t.*,
        a.nome as asset_name,
        a.tipo as asset_type
      FROM investment_transactions t
      LEFT JOIN investment_assets a ON t.asset_id = a.id
      WHERE t.user_id = ?
    `;
    const params = [filters.user_id];

    if (filters.asset_id) {
      sql += ' AND t.asset_id = ?';
      params.push(filters.asset_id);
    }

    if (filters.tipo) {
      sql += ' AND t.tipo = ?';
      params.push(filters.tipo);
    }

    if (filters.start_date) {
      sql += ' AND t.data >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += ' AND t.data <= ?';
      params.push(filters.end_date);
    }

    sql += ' ORDER BY t.data DESC, t.created_at DESC';

    return await db.all(sql, params);
  }

  static async findById(id, userId) {
    return await db.get(`
      SELECT 
        t.*,
        a.nome as asset_name,
        a.tipo as asset_type
      FROM investment_transactions t
      LEFT JOIN investment_assets a ON t.asset_id = a.id
      WHERE t.id = ? AND t.user_id = ?
    `, [id, userId]);
  }

  static async update(id, data, userId) {
    const updateSchema = investmentTransactionSchema.partial();
    await updateSchema.validate(data);

    // Se quantidade ou valor unitário foram alterados, recalcular valor total
    if (data.quantidade || data.valor_unitario) {
      const current = await this.findById(id, userId);
      if (!current) {
        const error = new Error('Transação não encontrada');
        error.name = 'NotFoundError';
        throw error;
      }

      const quantidade = data.quantidade || current.quantidade;
      const valor_unitario = data.valor_unitario || current.valor_unitario;
      data.valor_total = quantidade * valor_unitario;
    }

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id, userId);

    const result = await db.run(`
      UPDATE investment_transactions SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `, values);

    if (result.changes === 0) {
      const error = new Error('Transação não encontrada');
      error.name = 'NotFoundError';
      throw error;
    }

    return await this.findById(id, userId);
  }

  static async delete(id, userId) {
    const result = await db.run('DELETE FROM investment_transactions WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.changes === 0) {
      const error = new Error('Transação não encontrada');
      error.name = 'NotFoundError';
      throw error;
    }

    return { message: 'Transação excluída com sucesso' };
  }

  static async getPortfolioSummary(userId) {
    const sql = `
      SELECT 
        a.id,
        a.nome,
        a.tipo,
        a.setor,
        a.ativo,
        -- Quantidade atual em carteira
        COALESCE(SUM(CASE 
          WHEN t.tipo = 'compra' THEN t.quantidade 
          WHEN t.tipo = 'venda' THEN -t.quantidade 
          ELSE 0 END), 0) as quantidade_atual,
        
        -- Preço médio de compra (apenas compras)
        COALESCE(
          SUM(CASE WHEN t.tipo = 'compra' THEN t.valor_total ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN t.tipo = 'compra' THEN t.quantidade ELSE 0 END), 0), 
          0
        ) as preco_medio,
        
        -- Valor investido líquido (compras - vendas)
        COALESCE(SUM(CASE 
          WHEN t.tipo = 'compra' THEN t.valor_total 
          WHEN t.tipo = 'venda' THEN -t.valor_total 
          ELSE 0 END), 0) as valor_investido,
        
        -- Total de dividendos recebidos
        COALESCE(SUM(CASE 
          WHEN t.tipo = 'dividendos' THEN t.valor_total 
          ELSE 0 END), 0) as dividendos_recebidos,
        
        -- Total de compras (para referência)
        COALESCE(SUM(CASE WHEN t.tipo = 'compra' THEN t.valor_total ELSE 0 END), 0) as total_compras,
        
        -- Total de vendas (para referência)
        COALESCE(SUM(CASE WHEN t.tipo = 'venda' THEN t.valor_total ELSE 0 END), 0) as total_vendas
        
      FROM investment_assets a
      LEFT JOIN investment_transactions t ON a.id = t.asset_id AND t.user_id = ?
      WHERE a.user_id = ? AND a.ativo = 1
      GROUP BY a.id, a.nome, a.tipo, a.setor, a.ativo
      ORDER BY a.nome
    `;
    
    return await db.all(sql, [userId, userId]);
  }
}

module.exports = InvestmentTransaction;