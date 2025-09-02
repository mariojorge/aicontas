# Finance Control - Controle Financeiro Pessoal

Uma aplicação completa para gerenciamento de receitas e despesas pessoais, desenvolvida com Node.js e React.

## 🚀 Funcionalidades

### 💰 Gestão Financeira
- **Despesas**: Cadastro com situação (pago/aberto), categoria, subcategoria, data de pagamento
- **Receitas**: Cadastro com situação (recebido/aberto), categoria, subcategoria, data de recebimento
- **Repetição**: Suporte para transações únicas, parceladas ou fixas mensais
- **Dashboard**: Visão geral das finanças mensais com saldos e totais

### 📱 Design Responsivo
- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Tema Azul**: Design moderno com predominância da cor azul
- **Componentes Adaptativos**: Tabelas no desktop, cards no mobile
- **Menu Responsivo**: Navegação hamburger para telas menores

### 🔧 Tecnologias

#### Backend
- **Node.js** + **Express.js** - API RESTful
- **SQLite** - Banco de dados local
- **Yup** - Validação de dados
- **CORS** + **Helmet** - Segurança

#### Frontend
- **React 19** + **Vite** - Interface moderna e rápida
- **React Router** - Navegação SPA
- **Styled Components** - Estilização CSS-in-JS
- **React Hook Form** + **Yup** - Formulários e validação
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Instalação Automática
```bash
# Clone o repositório (se aplicável) e execute:
./start.sh
```

### Instalação Manual

#### 1. Instalar Dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### 2. Configurar Banco de Dados
```bash
cd backend
npm run init-db
```

#### 3. Executar a Aplicação

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
O servidor estará disponível em: http://localhost:3000

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
A aplicação estará disponível em: http://localhost:5173

## 📊 Estrutura do Projeto

```
finance-control/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── database/        # Configuração do banco
│   │   └── server.js        # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Forms/       # Formulários
│   │   │   ├── Lists/       # Listas e tabelas
│   │   │   ├── Layout/      # Layout e navegação
│   │   │   └── UI/          # Componentes de interface
│   │   ├── pages/           # Páginas principais
│   │   ├── services/        # Serviços de API
│   │   ├── styles/          # Temas e estilos globais
│   │   └── App.jsx          # Componente principal
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades Detalhadas

### Dashboard
- Saldo total do mês
- Total de receitas recebidas
- Total de despesas pagas
- Receitas e despesas pendentes
- Seletor de mês/ano

### Despesas
- Formulário completo com validações
- Lista responsiva (tabela/cards)
- Filtros por situação e categoria
- Edição e exclusão
- Repetição: única, parcelada ou fixa

### Receitas
- Formulário completo com validações  
- Lista responsiva (tabela/cards)
- Filtros por situação e categoria
- Edição e exclusão
- Repetição: única, parcelada ou fixa

## 🔄 API Endpoints

### Despesas
- `GET /api/expenses` - Listar despesas
- `POST /api/expenses` - Criar despesa
- `GET /api/expenses/:id` - Obter despesa
- `PUT /api/expenses/:id` - Atualizar despesa
- `DELETE /api/expenses/:id` - Excluir despesa

### Receitas
- `GET /api/incomes` - Listar receitas
- `POST /api/incomes` - Criar receita
- `GET /api/incomes/:id` - Obter receita
- `PUT /api/incomes/:id` - Atualizar receita
- `DELETE /api/incomes/:id` - Excluir receita

## 📱 Breakpoints Responsivos

- **Mobile**: até 768px
- **Tablet**: 769px - 1024px  
- **Desktop**: acima de 1024px

## 🎨 Paleta de Cores

- **Primary**: #2563eb (Blue-600)
- **Success**: #10b981 (Green-500)
- **Error**: #ef4444 (Red-500)
- **Warning**: #f59e0b (Amber-500)
- **Background**: #f8fafc (Gray-50)

## 🏗️ Desenvolvimento

### Scripts Backend
- `npm start` - Produção
- `npm run dev` - Desenvolvimento (nodemon)
- `npm run init-db` - Inicializar banco

### Scripts Frontend  
- `npm run dev` - Servidor desenvolvimento
- `npm run build` - Build produção
- `npm run preview` - Preview build
- `npm run lint` - Lint código

## 🐛 Problemas Corrigidos

- ✅ **Navegação**: Corrigido problema com links do menu não funcionando
- ✅ **Formulários**: Resolvido tela em branco ao cadastrar/editar (React Hook Form)
- ✅ **Extensões JSX**: Arquivos React renomeados para .jsx para compatibilidade
- ✅ **Erro 400**: Corrigido problema de validação Yup ("branch is not a function")
- ✅ **CRUD completo**: Cadastro, edição e exclusão funcionando perfeitamente
- ✅ **Calendário**: Seletor de data HTML5 nativo funcionando
- ✅ **Status automático**: Situação padrão "aberto" no cadastro
- ✅ **Responsividade**: Interface totalmente responsiva para mobile

## 📝 Próximas Funcionalidades

- [ ] Gráficos visuais nos relatórios
- [ ] Exportação para CSV/Excel
- [ ] Categorias personalizáveis
- [ ] Backup/restore de dados
- [ ] Metas e orçamentos mensais
- [ ] Funcionalidade de repetição avançada

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.