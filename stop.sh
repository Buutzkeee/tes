#!/bin/bash

# Script para parar a aplicação SaaS para advogados

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

# Parar os containers
echo "Parando os containers..."
docker-compose down

# Verificar se os containers foram parados
if [ $? -eq 0 ]; then
    echo "Aplicação parada com sucesso!"
else
    echo "Erro: Falha ao parar os containers."
    exit 1
fi

echo "Sistema SaaS para advogados foi encerrado."
