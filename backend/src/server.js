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
const PORT = process.env.PORT || 3000;

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

// Servir arquivos estáticos do frontend (se existir a pasta public)
const publicPath = path.join(__dirname, '../public');
if (require('fs').existsSync(publicPath)) {
  app.use(express.static(publicPath));
  
  // Para SPAs, redirecionar rotas de frontend (não-API) para o index.html
  app.get('*', (req, res) => {
    // Só serve o index.html se não for uma rota de API ou health
    if (!req.path.startsWith('/api') && req.path !== '/health') {
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  });
}

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