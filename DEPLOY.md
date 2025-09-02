# Deployment Guide for Sliplane.io

Este guia explica como fazer o deploy da aplicação Finance Control no Sliplane.io usando Docker.

## Estrutura do Projeto

A aplicação é composta por:
- **Backend**: API Node.js/Express com banco SQLite
- **Frontend**: React SPA servido via Nginx

## Arquivos de Deploy Criados

- `backend/Dockerfile` - Dockerfile para a API
- `frontend/Dockerfile` - Dockerfile multi-stage para React + Nginx
- `frontend/nginx.conf` - Configuração do Nginx com proxy para API
- `docker-compose.yml` - Orquestração dos serviços
- `.env.example` - Exemplo de variáveis de ambiente

## Preparação para Deploy

### 1. Configure as Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

**IMPORTANTE**: Altere o `JWT_SECRET` para um valor seguro em produção.

### 2. Para Deploy Local (Teste)

```bash
# Build e start dos containers
docker-compose up --build

# Acesse:
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

## Deploy no Sliplane.io

### 1. Preparação do Repositório

1. Certifique-se que todos os arquivos estão no repositório Git
2. Push para seu repositório (GitHub, GitLab, etc.)

### 2. Configuração no Sliplane.io

1. **Conecte seu repositório** no Sliplane.io
2. **Configure as variáveis de ambiente**:
   - `JWT_SECRET`: Chave secreta para JWT (obrigatório)
   - `NODE_ENV`: production
   - `PORT`: 3000
   - `VITE_API_URL`: URL da sua API no Sliplane

### 3. Arquivo de Configuração Sliplane

O Sliplane.io pode detectar automaticamente o `docker-compose.yml`. Se necessário, crie um arquivo `sliplane.toml`:

```toml
[build]
dockerfile = "docker-compose.yml"

[deploy]
port = 80

[env]
JWT_SECRET = "your-production-jwt-secret"
NODE_ENV = "production"
```

## Características da Configuração

### Backend
- **Base**: Node.js 18 Alpine (leve)
- **Porta**: 3000
- **Banco**: SQLite com volume persistente
- **Health check**: Endpoint `/health`
- **Segurança**: Executa como usuário `node`

### Frontend
- **Build**: Multi-stage (Node + Nginx)
- **Servidor**: Nginx Alpine
- **Porta**: 80
- **SPA**: Configured para React Router
- **API Proxy**: Requests `/api` redirecionados para backend

### Volumes
- `backend_data`: Persiste o banco SQLite

## Monitoramento

O backend inclui health check configurado. O Sliplane.io pode usar isso para monitoramento:

- **Endpoint**: `/health`
- **Intervalo**: 30s
- **Timeout**: 10s
- **Retries**: 3

## Segurança

- Containers executam como usuário não-root
- JWT secret configurável
- Headers de segurança via Helmet
- CORS configurado
- Nginx configurado com proxy seguro

## Troubleshooting

### Problemas Comuns

1. **API não conecta**: Verifique se `VITE_API_URL` está correto
2. **Banco não persiste**: Verifique se o volume está montado
3. **404 em rotas React**: Nginx configurado com `try_files` para SPA

### Logs

```bash
# Logs do backend
docker-compose logs backend

# Logs do frontend  
docker-compose logs frontend

# Logs de ambos
docker-compose logs
```

## Otimizações para Produção

- Backend usa `npm ci --only=production`
- Frontend build otimizado para produção
- Nginx com configuração de cache
- Health checks para reliability
- Volume para persistência de dados