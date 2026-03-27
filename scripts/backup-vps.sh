#!/bin/bash

# Script de Backup PsicoSaas para VPS
# Este script cria um dump do banco de dados PostgreSQL rodando no Docker.

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backups"
DB_CONTAINER="psicosaas_db"
DB_NAME="psico_db"
DB_USER="postgres"
OUTPUT_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

echo "🚀 Iniciando backup do banco de dados..."

# Executar pg_dump dentro do container
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $OUTPUT_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup concluído com sucesso!"
    echo "📂 Arquivo: $OUTPUT_FILE"
    
    # Compactar para economizar espaço
    gzip $OUTPUT_FILE
    echo "📦 Arquivo compactado: $OUTPUT_FILE.gz"
    
    # Manter apenas os últimos 5 backups para não encher o disco
    ls -t $BACKUP_DIR/db_backup_*.sql.gz | tail -n +6 | xargs rm -f 2>/dev/null
    
    echo "✨ Processo finalizado."
else
    echo "❌ Erro ao realizar o backup do banco de dados."
    exit 1
fi
