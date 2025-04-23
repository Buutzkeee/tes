#!/bin/bash

# Script para fazer backup dos dados da aplicação SaaS para advogados

# Verificar se o Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "Erro: Docker e/ou Docker Compose não estão instalados."
    echo "Por favor, instale-os antes de continuar."
    exit 1
fi

# Verificar se o arquivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "Erro: Arquivo docker-compose.yml não encontrado."
    exit 1
fi

# Criar diretório de backup se não existir
BACKUP_DIR="./backups"
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/backup_${BACKUP_DATE}"

mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_PATH"

echo "Iniciando backup em: $BACKUP_PATH"

# Verificar se o container do PostgreSQL está rodando
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "Aviso: Container do PostgreSQL não está rodando. O backup do banco de dados será ignorado."
else
    # Backup do banco de dados PostgreSQL
    echo "Fazendo backup do banco de dados..."
    docker-compose exec -T postgres pg_dump -U advogados_user advogados_saas > "${BACKUP_PATH}/database.sql"
    
    if [ $? -eq 0 ]; then
        echo "Backup do banco de dados concluído com sucesso."
    else
        echo "Erro: Falha ao fazer backup do banco de dados."
        exit 1
    fi
fi

# Backup dos volumes (opcional)
echo "Fazendo backup dos volumes..."
docker run --rm -v advogados-saas_postgres_data:/source -v $(pwd)/${BACKUP_PATH}:/backup alpine tar -czf /backup/postgres_data.tar.gz -C /source .
docker run --rm -v advogados-saas_redis_data:/source -v $(pwd)/${BACKUP_PATH}:/backup alpine tar -czf /backup/redis_data.tar.gz -C /source .

# Compactar o backup
echo "Compactando backup..."
tar -czf "${BACKUP_DIR}/backup_${BACKUP_DATE}.tar.gz" -C "${BACKUP_PATH}" .

# Remover diretório temporário
rm -rf "${BACKUP_PATH}"

echo "Backup concluído com sucesso: ${BACKUP_DIR}/backup_${BACKUP_DATE}.tar.gz"
echo "Para restaurar este backup, use o script restore.sh com o caminho do arquivo de backup."
