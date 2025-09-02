require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const db = require('./database/connection');

const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const categoryRoutes = require('./routes/categories');
const creditCardRoutes = require('./routes/creditCards');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas (autenticação)
app.use('/api/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/credit-cards', creditCardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance Control API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

const startServer = async () => {
  try {
    await db.connect();
    
    // Inicializar banco de dados se necessário
    const { initDatabase } = require('./database/init');
    try {
      await initDatabase(false); // false = não conectar novamente
    } catch (dbError) {
      console.error('⚠️  Erro na inicialização do banco (continuando):', dbError);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();