#!/bin/bash

# Script para iniciar a aplicação SaaS para advogados em ambiente de produção

# Verificar se o Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "Erro: Docker e/ou Docker Compose não estão instalados."
    echo "Por favor, instale-os antes de continuar."
    exit 1
fi

# Verificar se os arquivos necessários existem
if [ ! -f "docker-compose.yml" ]; then
    echo "Erro: Arquivo docker-compose.yml não encontrado."
    exit 1
fi

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Erro: Diretórios backend e/ou frontend não encontrados."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "Criando arquivo .env com configurações padrão..."
    cat > .env << EOL
# Configurações do PostgreSQL
POSTGRES_USER=advogados_user
POSTGRES_PASSWORD=advogados_password
POSTGRES_DB=advogados_saas

# Configurações do Backend
DATABASE_URL=postgresql://advogados_user:advogados_password@postgres:5432/advogados_saas
REDIS_URL=redis://redis:6379
JWT_SECRET=advogados_saas_jwt_secret_key_2025
PORT=3001
NODE_ENV=production

# Configurações do Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOL
    echo "Arquivo .env criado com sucesso."
fi

# Construir e iniciar os containers
echo "Construindo e iniciando os containers..."
docker-compose up -d --build

# Verificar se os containers estão rodando
echo "Verificando status dos containers..."
sleep 10
if docker-compose ps | grep -q "Up"; then
    echo "Aplicação iniciada com sucesso!"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:3001/api"
else
    echo "Erro: Falha ao iniciar alguns containers."
    docker-compose logs
    exit 1
fi

# Executar migrações do banco de dados
echo "Executando migrações do banco de dados..."
docker-compose exec backend npx prisma migrate deploy

echo "Sistema SaaS para advogados está pronto para uso!"
echo "Acesse http://localhost:3000 para começar a usar."
