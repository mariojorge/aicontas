const db = require('../database/connection');
const yup = require('yup');

const expenseSchema = yup.object().shape({
  descricao: yup.string().required('Descrição é obrigatória').min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  valor: yup.number().required('Valor é obrigatório').positive('Valor deve ser positivo'),
  situacao: yup.string().oneOf(['pago', 'aberto'], 'Situação deve ser "pago" ou "aberto"').required('Situação é obrigatória'),
  categoria: yup.string().required('Categoria é obrigatória'),
  subcategoria: yup.string().nullable().optional(),
  data_pagamento: yup.string().required('Data de pagamento é obrigatória'),
  repetir: yup.string().oneOf(['nao', 'parcelado', 'fixo']).optional(),
  parcelas: yup.number().integer().positive().optional(),
  parcela_atual: yup.number().integer().positive().optional(),
  cartao_credito_id: yup.number().integer().positive().nullable().optional()
});

class Expense {
  static async create(data) {
    await expenseSchema.validate(data);
    
    const {
      descricao,
      valor,
      situacao,
      categoria,
      subcategoria,
      data_pagamento,
      repetir = 'nao',
      parcelas = 1,
      parcela_atual = 1,
      cartao_credito_id = null
    } = data;

    const result = await db.run(`
      INSERT INTO expenses (
        descricao, valor, situacao, categoria, subcategoria, 
        data_pagamento, repetir, parcelas, parcela_atual, cartao_credito_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [descricao, valor, situacao, categoria, subcategoria, data_pagamento, repetir, parcelas, parcela_atual, cartao_credito_id]);

    return { id: result.id, ...data };
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        e.*,
        cc.nome as cartao_nome,
        cc.bandeira as cartao_bandeira
      FROM expenses e
      LEFT JOIN credit_cards cc ON e.cartao_credito_id = cc.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.situacao) {
      sql += ' AND e.situacao = ?';
      params.push(filters.situacao);
    }

    if (filters.categoria) {
      sql += ' AND e.categoria = ?';
      params.push(filters.categoria);
    }

    if (filters.mes && filters.ano) {
      sql += ' AND strftime("%m", e.data_pagamento) = ? AND strftime("%Y", e.data_pagamento) = ?';
      params.push(filters.mes.toString().padStart(2, '0'));
      params.push(filters.ano.toString());
    }

    sql += ' ORDER BY e.data_pagamento DESC';

    return await db.all(sql, params);
  }

  static async findById(id) {
    return await db.get('SELECT * FROM expenses WHERE id = ?', [id]);
  }

  static async update(id, data) {
    const updateSchema = expenseSchema.partial();
    await updateSchema.validate(data);

    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const result = await db.run(`
      UPDATE expenses SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, values);

    if (result.changes === 0) {
      throw new Error('Despesa não encontrada');
    }

    return await this.findById(id);
  }

  static async delete(id) {
    const result = await db.run('DELETE FROM expenses WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      throw new Error('Despesa não encontrada');
    }

    return { message: 'Despesa excluída com sucesso' };
  }

  static async findByGroup(descricao, repetir) {
    if (repetir === 'nao') return [];
    
    const baseDescricao = descricao.replace(/ \(\d+\/\d+\)$/, '');
    return await db.all(`
      SELECT * FROM expenses 
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
      UPDATE expenses SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE ${whereClause}
    `, values);

    return result;
  }

  static async getTotalByMonth(mes, ano) {
    const result = await db.get(`
      SELECT 
        SUM(CASE WHEN situacao = 'pago' THEN valor ELSE 0 END) as total_pago,
        SUM(CASE WHEN situacao = 'aberto' THEN valor ELSE 0 END) as total_aberto,
        SUM(valor) as total_geral
      FROM expenses 
      WHERE strftime("%m", data_pagamento) = ? AND strftime("%Y", data_pagamento) = ?
    `, [mes.toString().padStart(2, '0'), ano.toString()]);

    return {
      total_pago: result.total_pago || 0,
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
      FROM expenses 
      WHERE strftime("%m", data_pagamento) = ? AND strftime("%Y", data_pagamento) = ?
    `;
    
    const params = [mes.toString().padStart(2, '0'), ano.toString()];
    
    if (situacao) {
      sql += ` AND situacao = ?`;
      params.push(situacao);
    }
    
    sql += ` GROUP BY categoria ORDER BY total DESC`;
    
    return await db.all(sql, params);
  }

  static async findAllGroupedByCard(filters = {}) {
    let sql = `
      SELECT 
        e.*,
        cc.nome as cartao_nome,
        cc.bandeira as cartao_bandeira
      FROM expenses e
      LEFT JOIN credit_cards cc ON e.cartao_credito_id = cc.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.situacao) {
      sql += ' AND e.situacao = ?';
      params.push(filters.situacao);
    }

    if (filters.categoria) {
      sql += ' AND e.categoria = ?';
      params.push(filters.categoria);
    }

    if (filters.mes && filters.ano) {
      sql += ' AND strftime("%m", e.data_pagamento) = ? AND strftime("%Y", e.data_pagamento) = ?';
      params.push(filters.mes.toString().padStart(2, '0'));
      params.push(filters.ano.toString());
    }

    sql += ' ORDER BY e.data_pagamento DESC';

    const expenses = await db.all(sql, params);
    
    // Separar despesas regulares e agrupar as de cartão de crédito
    const result = [];
    const creditCardGroups = {};
    
    expenses.forEach(expense => {
      if (expense.cartao_credito_id && expense.cartao_nome) {
        const cardKey = expense.cartao_credito_id;
        if (!creditCardGroups[cardKey]) {
          creditCardGroups[cardKey] = {
            id: `card_${expense.cartao_credito_id}`,
            cartao_credito_id: expense.cartao_credito_id,
            cartao_nome: expense.cartao_nome,
            cartao_bandeira: expense.cartao_bandeira,
            valor: 0,
            count: 0,
            expenses: [],
            isCardGroup: true
          };
        }
        creditCardGroups[cardKey].valor += expense.valor;
        creditCardGroups[cardKey].count += 1;
        creditCardGroups[cardKey].expenses.push(expense);
      } else {
        result.push(expense);
      }
    });
    
    // Adicionar grupos de cartões ao resultado
    Object.values(creditCardGroups).forEach(group => {
      result.push(group);
    });
    
    // Ordenar por data (cartões ficam no final se não tiverem data)
    result.sort((a, b) => {
      const dateA = a.data_pagamento || '1900-01-01';
      const dateB = b.data_pagamento || '1900-01-01';
      return new Date(dateB) - new Date(dateA);
    });
    
    return result;
  }
}

module.exports = Expense;