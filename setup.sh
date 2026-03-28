#!/bin/bash

echo "🚀 Iniciando setup do NexusCore..."

# 1. Instalação de dependências
echo "📦 Instalando dependências..."
npm install

# 2. Subir infraestrutura básica
echo "🐳 Subindo containers de infra (Postgres, Redis, LocalStack)..."
docker-compose up -d postgres redis localstack

# 3. Aguardar Postgres ficar pronto
echo "⏳ Aguardando Postgres ficar pronto..."
until docker exec nexus-postgres pg_isready -U postgres; do
  sleep 1
done

# 4. Rodar migrações do Drizzle
echo "🔄 Rodando migrações do Drizzle..."
# Nota: Usando npx para rodar do contexto da api
cd apps/api && npx drizzle-kit push && cd ../..

echo "✅ Ambiente pronto! Use 'docker-compose up' para rodar os serviços da aplicação."
