const db = require('../database/connection');
const yup = require('yup');

const incomeSchema = yup.object().shape({
  descricao: yup.string().required('Descrição é obrigatória').min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  valor: yup.number().required('Valor é obrigatório').positive('Valor deve ser positivo'),
  situacao: yup.string().oneOf(['recebido', 'aberto'], 'Situação deve ser "recebido" ou "aberto"').required('Situação é obrigatória'),
  categoria: yup.string().required('Categoria é obrigatória'),
  subcategoria: yup.string().nullable().optional(),
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
      subcategoria,
      data_recebimento,
      repetir = 'nao',
      parcelas = 1,
      parcela_atual = 1
    } = data;

    const result = await db.run(`
      INSERT INTO incomes (
        descricao, valor, situacao, categoria, subcategoria, 
        data_recebimento, repetir, parcelas, parcela_atual
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [descricao, valor, situacao, categoria, subcategoria, data_recebimento, repetir, parcelas, parcela_atual]);

    return { id: result.id, ...data };
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM incomes WHERE 1=1';
    const params = [];

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

  static async findById(id) {
    return await db.get('SELECT * FROM incomes WHERE id = ?', [id]);
  }

  static async update(id, data) {
    const updateSchema = incomeSchema.partial();
    await updateSchema.validate(data);

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const result = await db.run(`
      UPDATE incomes SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);

    if (result.changes === 0) {
      throw new Error('Receita não encontrada');
    }

    return await this.findById(id);
  }

  static async delete(id) {
    const result = await db.run('DELETE FROM incomes WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      throw new Error('Receita não encontrada');
    }

    return { message: 'Receita excluída com sucesso' };
  }

  static async findByGroup(descricao, repetir) {
    if (repetir === 'nao') return [];
    
    const baseDescricao = descricao.replace(/ \(\d+\/\d+\)$/, '');
    return await db.all(`
      SELECT * FROM incomes 
      WHERE descricao LIKE ? AND repetir = ?
      ORDER BY parcela_atual
    `, [`${baseDescricao}%`, repetir]);
  }

  static async updateGroup(baseDescricao, repetir, data, updateAllOpen = false) {
    const baseDesc = baseDescricao.replace(/ \(\d+\/\d+\)$/, '');
    
    let whereClause = 'descricao LIKE ? AND repetir = ?';
    let params = [`${baseDesc}%`, repetir];
    
    if (updateAllOpen) {
      whereClause += ' AND situacao = "aberto"';
    }

    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'descricao')
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'descricao')
      .map(key => data[key]);
    
    values.push(...params);

    const result = await db.run(`
      UPDATE incomes SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE ${whereClause}
    `, values);

    return result;
  }

  static async getTotalByMonth(mes, ano) {
    const result = await db.get(`
      SELECT 
        SUM(CASE WHEN situacao = 'recebido' THEN valor ELSE 0 END) as total_recebido,
        SUM(CASE WHEN situacao = 'aberto' THEN valor ELSE 0 END) as total_aberto,
        SUM(valor) as total_geral
      FROM incomes 
      WHERE strftime("%m", data_recebimento) = ? AND strftime("%Y", data_recebimento) = ?
    `, [mes.toString().padStart(2, '0'), ano.toString()]);

    return {
      total_recebido: result.total_recebido || 0,
      total_aberto: result.total_aberto || 0,
      total_geral: result.total_geral || 0
    };
  }

  static async getByCategory(mes, ano, situacao = null) {
    let sql = `
      SELECT 
        categoria,
        SUM(valor) as total,
        COUNT(*) as quantidade
      FROM incomes 
      WHERE strftime("%m", data_recebimento) = ? AND strftime("%Y", data_recebimento) = ?
    `;
    
    const params = [mes.toString().padStart(2, '0'), ano.toString()];
    
    if (situacao) {
      sql += ` AND situacao = ?`;
      params.push(situacao);
    }
    
    sql += ` GROUP BY categoria ORDER BY total DESC`;
    
    return await db.all(sql, params);
  }
}

module.exports = Income;