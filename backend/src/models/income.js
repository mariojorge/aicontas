const db = require('../database/connection');
const yup = require('yup');

const incomeSchema = yup.object().shape({
  descricao: yup.string().required('Descrição é obrigatória').min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  valor: yup.number().required('Valor é obrigatório').positive('Valor deve ser positivo'),
  situacao: yup.string().oneOf(['recebido', 'aberto'], 'Situação deve ser "recebido" ou "aberto"').required('Situação é obrigatória'),
  categoria: yup.string().required('Categoria é obrigatória'),
  data_recebimento: yup.string().required('Data de recebimento é obrigatória'),
  repetir: yup.string().oneOf(['nao', 'parcelado', 'fixo']).optional(),
  parcelas: yup.number().integer().positive().optional(),
  parcela_atual: yup.number().integer().positive().optional()
});

class Income {
  static async create(data) {
    await incomeSchema.validate(data);
    
    const {
      descricao,
      valor,
      situacao,
      categoria,
      data_recebimento,
      repetir = 'nao',
      parcelas = 1,
      parcela_atual = 1,
      user_id
    } = data;

    const result = await db.run(`
      INSERT INTO incomes (
        descricao, valor, situacao, categoria, 
        data_recebimento, repetir, parcelas, parcela_atual, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [descricao, valor, situacao, categoria, data_recebimento, repetir, parcelas, parcela_atual, user_id]);

    return { id: result.id, ...data };
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM incomes WHERE user_id = ?';
    const params = [filters.user_id];

    if (filters.situacao) {
      sql += ' AND situacao = ?';
      params.push(filters.situacao);
    }

    if (filters.categoria) {
      sql += ' AND categoria = ?';
      params.push(filters.categoria);
    }

    if (filters.mes && filters.ano) {
      sql += ' AND strftime("%m", data_recebimento) = ? AND strftime("%Y", data_recebimento) = ?';
      params.push(filters.mes.toString().padStart(2, '0'));
      params.push(filters.ano.toString());
    }

    sql += ' ORDER BY data_recebimento DESC';

    return await db.all(sql, params);
  }

  static async findById(id, userId) {
    return await db.get('SELECT * FROM incomes WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async update(id, data, userId) {
    const updateSchema = incomeSchema.partial();
    await updateSchema.validate(data);

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id, userId);

    const result = await db.run(`
      UPDATE incomes SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `, values);

    if (result.changes === 0) {
      throw new Error('Receita não encontrada');
    }

    return await this.findById(id, userId);
  }

  static async delete(id, userId) {
    const result = await db.run('DELETE FROM incomes WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.changes === 0) {
      throw new Error('Receita não encontrada');
    }

    return { message: 'Receita excluída com sucesso' };
  }

  static async findByGroup(descricao, repetir, userId) {
    if (repetir === 'nao') return [];
    
    const baseDescricao = descricao.replace(/ \(\d+\/\d+\)$/, '');
    return await db.all(`
      SELECT * FROM incomes 
      WHERE descricao LIKE ? AND repetir = ? AND user_id = ?
      ORDER BY parcela_atual
    `, [`${baseDescricao}%`, repetir, userId]);
  }

  static async updateGroup(baseDescricao, repetir, data, updateAllOpen = false, userId) {
    const baseDesc = baseDescricao.replace(/ \(\d+\/\d+\)$/, '');
    
    let whereClause = 'descricao LIKE ? AND repetir = ? AND user_id = ?';
    let params = [`${baseDesc}%`, repetir, userId];
    
    if (updateAllOpen) {
      whereClause += ' AND situacao = "aberto"';
    }

    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'descricao' && key !== 'data_recebimento')
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'descricao' && key !== 'data_recebimento')
      .map(key => data[key]);
    
    values.push(...params);

    const result = await db.run(`
      UPDATE incomes SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE ${whereClause}
    `, values);

    return result;
  }

  static async getTotalByMonth(mes, ano, userId) {
    const result = await db.get(`
      SELECT 
        SUM(CASE WHEN situacao = 'recebido' THEN valor ELSE 0 END) as total_recebido,
        SUM(CASE WHEN situacao = 'aberto' THEN valor ELSE 0 END) as total_aberto,
        SUM(valor) as total_geral
      FROM incomes 
      WHERE strftime("%m", data_recebimento) = ? AND strftime("%Y", data_recebimento) = ? AND user_id = ?
    `, [mes.toString().padStart(2, '0'), ano.toString(), userId]);

    return {
      total_recebido: result.total_recebido || 0,
      total_aberto: result.total_aberto || 0,
      total_geral: result.total_geral || 0
    };
  }

  static async getByCategory(mes, ano, situacao = null, userId) {
    let sql = `
      SELECT 
        categoria,
        SUM(valor) as total,
        COUNT(*) as quantidade
      FROM incomes 
      WHERE strftime("%m", data_recebimento) = ? AND strftime("%Y", data_recebimento) = ? AND user_id = ?
    `;
    
    const params = [mes.toString().padStart(2, '0'), ano.toString(), userId];
    
    if (situacao) {
      sql += ` AND situacao = ?`;
      params.push(situacao);
    }
    
    sql += ` GROUP BY categoria ORDER BY total DESC`;
    
    return await db.all(sql, params);
  }
}

module.exports = Income;