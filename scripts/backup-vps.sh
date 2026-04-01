#!/bin/bash

# Script de Backup PsicoSaas para VPS com Google Drive
# Este script cria um dump do banco de dados PostgreSQL e envia para o Google Drive via Rclone.

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/root/apps/psicosaas/backups"
DB_CONTAINER="psicosaas_db"
DB_NAME="psico_db"
DB_USER="postgres"
OUTPUT_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
REMOTE_PATH="gdrive:Backups_Gestao_Terapeutica"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

echo "🚀 [$(date)] Iniciando backup do banco de dados..."

# Executar pg_dump dentro do container
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $OUTPUT_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup local concluído."
    
    # Compactar para economizar espaço
    gzip $OUTPUT_FILE
    GZ_FILE="$OUTPUT_FILE.gz"
    echo "📦 Arquivo compactado: $GZ_FILE"
    
    # 1. Enviar para o Google Drive
    echo "☁️  Enviando para o Google Drive ($REMOTE_PATH)..."
    rclone copy $GZ_FILE $REMOTE_PATH
    
    if [ $? -eq 0 ]; then
        echo "✅ Upload para o Google Drive concluído com sucesso!"
    else
        echo "⚠️  Erro ao enviar para o Google Drive. O backup local foi mantido."
    fi

    # 2. Limpeza Local (Manter apenas os últimos 5)
    echo "🧹 Limpando backups locais antigos..."
    ls -t $BACKUP_DIR/db_backup_*.sql.gz | tail -n +6 | xargs rm -f 2>/dev/null
    
    # 3. Limpeza no Google Drive (Manter apenas 30 dias)
    echo "🧹 Limpando backups antigos no Google Drive (mais de 30 dias)..."
    rclone delete --min-age 30d $REMOTE_PATH
    
    echo "✨ Processo de backup finalizado com sucesso."
else
    echo "❌ Erro ao realizar o backup do banco de dados."
    exit 1
fi
