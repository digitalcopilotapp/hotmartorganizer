#!/bin/bash

# Script de Gerenciamento do Hotmart Organizer MCP

function show_help {
    echo "Uso: ./manage.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start       - Inicia todos os serviços (Docker)"
    echo "  stop        - Para todos os serviços"
    echo "  restart     - Reinicia os serviços"
    echo "  logs        - Mostra logs da aplicação"
    echo "  migrate     - Roda migrações do banco de dados"
    echo "  backup      - Realiza backup do banco de dados"
    echo "  verify      - Verifica conexões externas (Brevo/AI)"
    echo "  help        - Mostra esta ajuda"
}

case "$1" in
    start)
        echo "🚀 Iniciando serviços..."
        docker-compose up -d --build
        ;;
    stop)
        echo "🛑 Parando serviços..."
        docker-compose down
        ;;
    restart)
        echo "🔄 Reiniciando..."
        docker-compose down && docker-compose up -d --build
        ;;
    logs)
        docker-compose logs -f app
        ;;
    migrate)
        echo "🐘 Executando migrações Prisma..."
        npx prisma migrate dev
        ;;
    backup)
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        echo "💾 Realizando backup para backup_$TIMESTAMP.sql..."
        docker exec -t hotmart_organizer_db pg_dumpall -c -U postgres > "backup_$TIMESTAMP.sql"
        echo "✅ Backup concluído."
        ;;
    verify)
        echo "🔍 Verificando conexões..."
        npm run verify
        ;;
    *)
        show_help
        ;;
esac
