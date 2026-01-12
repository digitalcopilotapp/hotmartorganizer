# Manual de Operação - Hotmart Organizer MCP

## Arquitetura do Sistema

O sistema opera como um MCP (Microservice Control Platform) centralizando eventos da Hotmart, inteligência via OpenRouter e ações no Brevo CRM.

### Componentes:
1.  **API Server (Node.js/Express)**: Recebe webhooks, valida autenticação e orquestra fluxos.
2.  **Database (PostgreSQL + pgvector)**:
    *   Persistência de Logs (Audit Trail).
    *   Armazenamento de Vendas e Contatos.
    *   Suporte a Vetores (Embeddings) para futura busca semântica de perfis.
3.  **Scheduler (Node-Cron)**: Executa rotinas de manutenção e healthchecks internos.
4.  **AI Worker**: Integrado na API, processa prompts via OpenRouter.

## Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo

1. **Configurar Variáveis de Ambiente**
   Copie `.env.example` para `.env` e preencha as credenciais.

2. **Iniciar Serviços**
   ```bash
   docker-compose up -d --build
   ```

3. **Migração do Banco de Dados**
   Na primeira execução, o container da aplicação tentará conectar ao banco. Se necessário rodar migrações manuais:
   ```bash
   # Rodar dentro do container ou localmente se tiver node instalado
   npx prisma migrate dev --name init
   ```

## Monitoramento

- **Healthcheck Endpoint**: `GET /health`
  - Retorna status da aplicação e conexão com banco de dados.
- **Logs**:
  - Logs de aplicação: `docker logs -f hotmart_organizer_app`
  - Logs de auditoria: Salvos na tabela `logs` do PostgreSQL.

## Procedimentos de Backup

O volume do banco de dados está mapeado em `postgres_data`.

**Backup Manual:**
```bash
docker exec -t hotmart_organizer_db pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

**Restore:**
```bash
cat seu_dump.sql | docker exec -i hotmart_organizer_db psql -U postgres
```

## Estrutura de Rotinas (Scripts)

As rotinas estão definidas em `src/services/schedulerService.ts`.
- **Log Cleanup**: Remove logs com mais de 30 dias (Diário, 00:00).
- **Health Monitor**: Verifica conexão DB (Hora em hora).
