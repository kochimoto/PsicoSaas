#!/bin/bash
# ============================================================
# PsicoSaas — Setup VPS Ubuntu 22.04 (sem Nginx)
# ============================================================
set -e

echo "========================================="
echo "   PsicoSaas — VPS Setup (Ubuntu 22)"
echo "========================================="

# 1. Atualizar sistema
echo "[1/7] Atualizando sistema..."
apt-get update -y && apt-get upgrade -y

# 2. Instalar Docker
echo "[2/7] Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker instalado com sucesso!"
else
    echo "Docker já está instalado."
fi

# 3. Instalar Docker Compose (plugin)
echo "[3/7] Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
fi

# 4. Instalar Git
echo "[4/7] Instalando Git..."
apt-get install -y git

# 5. Clonar repositório
echo "[5/7] Clonando repositório..."
APP_DIR="/root/apps/psicosaas"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    mkdir -p /root/apps
    git clone https://github.com/kochimoto/PsicoSaas.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 6. Criar arquivo .env
echo "[6/7] Criando .env de produção..."
cat > "$APP_DIR/.env" << 'EOF'
DATABASE_URL="postgresql://postgres:intelbras3246@psicosaas_db:5432/psico_db"
DIRECT_URL="postgresql://postgres:intelbras3246@psicosaas_db:5432/psico_db"
JWT_SECRET="secret_super_seguro_para_desenvolvimento_local"
NEXTAUTH_URL="https://www.laisbritoofc.com.br"
NEXTAUTH_SECRET="secret_super_seguro_para_desenvolvimento_local"
NEXT_PUBLIC_APP_URL="https://www.laisbritoofc.com.br"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="YOUR_STRIPE_PUBLIC_KEY_HERE"
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY_HERE"
WHATS_API_URL="http://evolution:8080"
WHATS_API_KEY="123456"
WHATS_MASTER_INSTANCE="psico_system_master"
EOF

# 7. Permissões
echo "[7/7] Configurando permissões..."
chmod +x init-db.sh 2>/dev/null || true

echo ""
echo "========================================="
echo "   Setup concluído! Agora execute:"
echo "========================================="
echo ""
echo "  cd $APP_DIR"
echo "  docker compose up -d --build"
echo ""
echo "  # Aguarde ~3-5 min para o build terminar"
echo "  # Verifique com: docker compose logs -f psicosaas"
echo ""
echo "  # Depois que o app subir:"
echo "  docker exec psicosaas npx prisma migrate deploy"
echo "  docker exec psicosaas npx prisma db seed"
echo ""
echo "  Acesse: https://www.laisbritoofc.com.br"
echo "========================================="
