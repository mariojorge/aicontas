const db = require('./connection');

const initDatabase = async () => {
  try {
    await db.connect();
    
    // Tabela de despesas
    await db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        situacao TEXT CHECK(situacao IN ('pago', 'aberto')) NOT NULL,
        categoria TEXT NOT NULL,
        subcategoria TEXT,
        data_pagamento DATE NOT NULL,
        repetir TEXT CHECK(repetir IN ('nao', 'parcelado', 'fixo')) DEFAULT 'nao',
        parcelas INTEGER DEFAULT 1,
        parcela_atual INTEGER DEFAULT 1,
        cartao_credito_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cartao_credito_id) REFERENCES credit_cards(id)
      )
    `);

    // Tabela de receitas
    await db.run(`
      CREATE TABLE IF NOT EXISTS incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        situacao TEXT CHECK(situacao IN ('recebido', 'aberto')) NOT NULL,
        categoria TEXT NOT NULL,
        subcategoria TEXT,
        data_recebimento DATE NOT NULL,
        repetir TEXT CHECK(repetir IN ('nao', 'parcelado', 'fixo')) DEFAULT 'nao',
        parcelas INTEGER DEFAULT 1,
        parcela_atual INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de categorias
    await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT CHECK(tipo IN ('receita', 'despesa')) NOT NULL,
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de cartões de crédito
    await db.run(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        bandeira TEXT NOT NULL,
        melhor_dia_compra INTEGER NOT NULL CHECK(melhor_dia_compra >= 1 AND melhor_dia_compra <= 31),
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Banco de dados inicializado com sucesso!');
    
    // Dados de exemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  } finally {
    await db.close();
  }
};

const insertSampleData = async () => {
  try {
    // Verifica se já existe dados
    const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses');
    const incomeCount = await db.get('SELECT COUNT(*) as count FROM incomes');
    const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
    const creditCardCount = await db.get('SELECT COUNT(*) as count FROM credit_cards');

    // Inserir categorias primeiro
    if (categoryCount.count === 0) {
      await db.run(`
        INSERT INTO categories (nome, tipo, ativo)
        VALUES 
          ('Alimentação', 'despesa', 1),
          ('Transporte', 'despesa', 1),
          ('Moradia', 'despesa', 1),
          ('Outros', 'despesa', 1),
          ('Trabalho', 'receita', 1),
          ('Freelance', 'receita', 1),
          ('Investimento', 'receita', 1),
          ('Outros', 'receita', 1)
      `);
    }

    if (expenseCount.count === 0) {
      await db.run(`
        INSERT INTO expenses (descricao, valor, situacao, categoria, subcategoria, data_pagamento, repetir)
        VALUES 
          ('Supermercado', 150.50, 'pago', 'Alimentação', 'Compras', '2024-01-15', 'nao'),
          ('Internet', 89.90, 'pago', 'Fixas', 'Telecomunicação', '2024-01-10', 'fixo'),
          ('Gasolina', 200.00, 'aberto', 'Transporte', 'Combustível', '2024-01-20', 'nao')
      `);
    }

    if (incomeCount.count === 0) {
      await db.run(`
        INSERT INTO incomes (descricao, valor, situacao, categoria, subcategoria, data_recebimento, repetir)
        VALUES 
          ('Salário', 3500.00, 'recebido', 'Trabalho', 'Salário', '2024-01-05', 'fixo'),
          ('Freelance', 800.00, 'aberto', 'Trabalho', 'Extra', '2024-01-25', 'nao'),
          ('Dividendos', 120.00, 'recebido', 'Investimento', 'Ações', '2024-01-15', 'nao')
      `);
    }

    // Inserir cartões de exemplo
    if (creditCardCount.count === 0) {
      await db.run(`
        INSERT INTO credit_cards (nome, bandeira, melhor_dia_compra, ativo)
        VALUES 
          ('Cartão Principal', 'Visa', 5, 1),
          ('Cartão Internacional', 'Mastercard', 10, 1),
          ('Cartão Reserva', 'Elo', 15, 0)
      `);
    }

    console.log('📊 Dados de exemplo inseridos!');
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  }
};

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };