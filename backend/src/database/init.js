const db = require('./connection');
const { v4: uuidv4 } = require('uuid');

const addGroupIdColumns = async () => {
  try {
    // Verificar se a coluna group_id já existe nas tabelas
    const expensesColumns = await db.all("PRAGMA table_info(expenses)");
    const incomesColumns = await db.all("PRAGMA table_info(incomes)");

    // Adicionar group_id à tabela expenses se não existir
    if (!expensesColumns.find(col => col.name === 'group_id')) {
      await db.run('ALTER TABLE expenses ADD COLUMN group_id TEXT');
      console.log('✅ Coluna group_id adicionada à tabela expenses');
      
      // Migrar dados existentes de expenses
      await migrateExistingExpenseGroups();
    }

    // Adicionar group_id à tabela incomes se não existir
    if (!incomesColumns.find(col => col.name === 'group_id')) {
      await db.run('ALTER TABLE incomes ADD COLUMN group_id TEXT');
      console.log('✅ Coluna group_id adicionada à tabela incomes');
      
      // Migrar dados existentes de incomes
      await migrateExistingIncomeGroups();
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas group_id:', error);
  }
};

const migrateExistingExpenseGroups = async () => {
  try {
    // Buscar todas as despesas que podem ter grupos (fixo ou parcelado)
    const expenses = await db.all(`
      SELECT id, descricao, repetir, user_id 
      FROM expenses 
      WHERE repetir IN ('fixo', 'parcelado') 
      AND group_id IS NULL
      ORDER BY descricao, user_id, created_at
    `);

    const groups = {};
    
    for (const expense of expenses) {
      // Extrair descrição base (sem (x/y) para parceladas)
      const baseDescricao = expense.descricao.replace(/ \(\d+\/\d+\)$/, '');
      const groupKey = `${baseDescricao}_${expense.repetir}_${expense.user_id}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          group_id: uuidv4(),
          ids: []
        };
      }
      
      groups[groupKey].ids.push(expense.id);
    }
    
    // Atualizar registros com os group_ids
    for (const group of Object.values(groups)) {
      if (group.ids.length > 0) {
        const placeholders = group.ids.map(() => '?').join(',');
        await db.run(
          `UPDATE expenses SET group_id = ? WHERE id IN (${placeholders})`,
          [group.group_id, ...group.ids]
        );
      }
    }
    
    console.log(`✅ Migração de group_id em expenses concluída: ${Object.keys(groups).length} grupos processados`);
  } catch (error) {
    console.error('❌ Erro ao migrar group_id de expenses:', error);
  }
};

const migrateExistingIncomeGroups = async () => {
  try {
    // Buscar todas as receitas que podem ter grupos (fixo ou parcelado)
    const incomes = await db.all(`
      SELECT id, descricao, repetir, user_id 
      FROM incomes 
      WHERE repetir IN ('fixo', 'parcelado') 
      AND group_id IS NULL
      ORDER BY descricao, user_id, created_at
    `);

    const groups = {};
    
    for (const income of incomes) {
      // Extrair descrição base (sem (x/y) para parceladas)
      const baseDescricao = income.descricao.replace(/ \(\d+\/\d+\)$/, '');
      const groupKey = `${baseDescricao}_${income.repetir}_${income.user_id}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          group_id: uuidv4(),
          ids: []
        };
      }
      
      groups[groupKey].ids.push(income.id);
    }
    
    // Atualizar registros com os group_ids
    for (const group of Object.values(groups)) {
      if (group.ids.length > 0) {
        const placeholders = group.ids.map(() => '?').join(',');
        await db.run(
          `UPDATE incomes SET group_id = ? WHERE id IN (${placeholders})`,
          [group.group_id, ...group.ids]
        );
      }
    }
    
    console.log(`✅ Migração de group_id em incomes concluída: ${Object.keys(groups).length} grupos processados`);
  } catch (error) {
    console.error('❌ Erro ao migrar group_id de incomes:', error);
  }
};

const addUserIdColumns = async () => {
  try {
    // Verificar se a coluna user_id já existe nas tabelas
    const expensesColumns = await db.all("PRAGMA table_info(expenses)");
    const incomesColumns = await db.all("PRAGMA table_info(incomes)");
    const categoriesColumns = await db.all("PRAGMA table_info(categories)");

    // Adicionar user_id à tabela expenses se não existir
    if (!expensesColumns.find(col => col.name === 'user_id')) {
      await db.run('ALTER TABLE expenses ADD COLUMN user_id INTEGER REFERENCES users(id)');
      console.log('✅ Coluna user_id adicionada à tabela expenses');
    }

    // Adicionar user_id à tabela incomes se não existir
    if (!incomesColumns.find(col => col.name === 'user_id')) {
      await db.run('ALTER TABLE incomes ADD COLUMN user_id INTEGER REFERENCES users(id)');
      console.log('✅ Coluna user_id adicionada à tabela incomes');
    }

    // Adicionar user_id à tabela categories se não existir
    if (!categoriesColumns.find(col => col.name === 'user_id')) {
      await db.run('ALTER TABLE categories ADD COLUMN user_id INTEGER REFERENCES users(id)');
      console.log('✅ Coluna user_id adicionada à tabela categories');
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas user_id:', error);
  }
};

const initDatabase = async (shouldConnect = true) => {
  try {
    if (shouldConnect) {
      await db.connect();
    }
    
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
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Tabela de usuários
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Adicionar user_id às tabelas existentes se não existir
    await addUserIdColumns();
    
    // Adicionar group_id às tabelas existentes se não existir
    await addGroupIdColumns();

    console.log('✅ Banco de dados inicializado com sucesso!');
    
    // Dados de exemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  } finally {
    if (shouldConnect) {
      await db.close();
    }
  }
};

const insertSampleData = async () => {
  try {
    // Verifica se já existe dados
    const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses');
    const incomeCount = await db.get('SELECT COUNT(*) as count FROM incomes');
    const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
    const creditCardCount = await db.get('SELECT COUNT(*) as count FROM credit_cards');
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');

    // Inserir usuário padrão primeiro
    let defaultUserId = null;
    if (userCount.count === 0) {
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('123456', 10);
      
      const result = await db.run(`
        INSERT INTO users (nome, email, password_hash)
        VALUES ('Usuário Admin', 'admin@finance.com', ?)
      `, [defaultPassword]);
      
      defaultUserId = result.id;
      console.log('👤 Usuário padrão criado: admin@finance.com / senha: 123456');
    } else {
      // Pegar ID do primeiro usuário
      const user = await db.get('SELECT id FROM users LIMIT 1');
      defaultUserId = user.id;
    }

    // Inserir categorias primeiro
    if (categoryCount.count === 0) {
      await db.run(`
        INSERT INTO categories (nome, tipo, ativo, user_id)
        VALUES 
          ('Alimentação', 'despesa', 1, ?),
          ('Transporte', 'despesa', 1, ?),
          ('Moradia', 'despesa', 1, ?),
          ('Outros', 'despesa', 1, ?),
          ('Trabalho', 'receita', 1, ?),
          ('Freelance', 'receita', 1, ?),
          ('Investimento', 'receita', 1, ?),
          ('Outros', 'receita', 1, ?)
      `, [defaultUserId, defaultUserId, defaultUserId, defaultUserId, defaultUserId, defaultUserId, defaultUserId, defaultUserId]);
    }

    if (expenseCount.count === 0) {
      await db.run(`
        INSERT INTO expenses (descricao, valor, situacao, categoria, subcategoria, data_pagamento, repetir, user_id)
        VALUES 
          ('Supermercado', 150.50, 'pago', 'Alimentação', 'Compras', '2024-01-15', 'nao', ?),
          ('Internet', 89.90, 'pago', 'Fixas', 'Telecomunicação', '2024-01-10', 'fixo', ?),
          ('Gasolina', 200.00, 'aberto', 'Transporte', 'Combustível', '2024-01-20', 'nao', ?)
      `, [defaultUserId, defaultUserId, defaultUserId]);
    }

    if (incomeCount.count === 0) {
      await db.run(`
        INSERT INTO incomes (descricao, valor, situacao, categoria, subcategoria, data_recebimento, repetir, user_id)
        VALUES 
          ('Salário', 3500.00, 'recebido', 'Trabalho', 'Salário', '2024-01-05', 'fixo', ?),
          ('Freelance', 800.00, 'aberto', 'Trabalho', 'Extra', '2024-01-25', 'nao', ?),
          ('Dividendos', 120.00, 'recebido', 'Investimento', 'Ações', '2024-01-15', 'nao', ?)
      `, [defaultUserId, defaultUserId, defaultUserId]);
    }

    // Inserir cartões de exemplo
    if (creditCardCount.count === 0) {
      await db.run(`
        INSERT INTO credit_cards (nome, bandeira, melhor_dia_compra, ativo, user_id)
        VALUES 
          ('Cartão Principal', 'Visa', 5, 1, ?),
          ('Cartão Internacional', 'Mastercard', 10, 1, ?),
          ('Cartão Reserva', 'Elo', 15, 0, ?)
      `, [defaultUserId, defaultUserId, defaultUserId]);
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