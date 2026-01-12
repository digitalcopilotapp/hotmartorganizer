# Guia de Deploy - Hotmart Organizer

Este projeto está pronto para ser implantado em diversos provedores de nuvem. Abaixo estão as instruções para as opções mais recomendadas.

## Opção 1: Render.com (Recomendado - Fácil e Grátis/Barato)

O projeto já inclui um arquivo `render.yaml` para configuração automática (Blueprint).

1.  Crie uma conta no [Render.com](https://render.com/).
2.  Conecte sua conta do GitHub/GitLab.
3.  No dashboard, clique em **New +** e selecione **Blueprint**.
4.  Conecte o repositório deste projeto.
5.  O Render detectará o arquivo `render.yaml` e sugerirá a criação de:
    *   **Service**: `hotmart-organizer-app` (Sua aplicação)
    *   **Database**: `hotmart-organizer-db` (Banco PostgreSQL)
6.  **Variáveis de Ambiente**: Durante a criação, você precisará preencher as variáveis sensíveis que estão marcadas como `sync: false`:
    *   `HOTMART_TOKEN`: Seu token da Hotmart.
    *   `BREVO_API_KEY`: Sua chave de API do Brevo.
    *   `OPENROUTER_API_KEY`: Sua chave de API do OpenRouter.
7.  Clique em **Apply** e aguarde o deploy.

## Opção 2: Railway (Alternativa Robusta)

O Railway detecta automaticamente o `Dockerfile` e facilita a adição de banco de dados.

1.  Crie uma conta no [Railway.app](https://railway.app/).
2.  Clique em **New Project** -> **Deploy from GitHub repo**.
3.  Selecione o repositório do projeto.
4.  O Railway iniciará o deploy da aplicação.
5.  **Adicionar Banco de Dados**:
    *   Clique em **New** -> **Database** -> **PostgreSQL**.
    *   Aguarde a criação.
6.  **Configurar Variáveis**:
    *   Vá na aba **Variables** do seu serviço de aplicação (Node.js).
    *   Adicione `DATABASE_URL`: Use a variável de referência do PostgreSQL criado (geralmente `${{PostgreSQL.DATABASE_URL}}`).
    *   Adicione as outras variáveis (`HOTMART_TOKEN`, `BREVO_API_KEY`, etc.).
7.  O Railway fará o redeploy automaticamente.

## Opção 3: VPS (DigitalOcean, AWS, Hetzner) com Docker Compose

Para controle total e menor custo em escala.

1.  Provisione um servidor Linux (Ubuntu 20.04+ é recomendado) com Docker e Docker Compose instalados.
2.  Clone o repositório no servidor:
    ```bash
    git clone https://seu-git-repo/hotmartorganizer.git
    cd hotmartorganizer
    ```
3.  Crie o arquivo `.env` de produção (baseado no `.env.example`):
    ```bash
    cp .env.example .env
    nano .env
    # Preencha com suas credenciais reais
    ```
4.  Inicie os serviços:
    ```bash
    docker-compose up -d --build
    ```
5.  (Opcional) Configure um Proxy Reverso (Nginx/Traefik) para HTTPS.

## Pós-Deploy

Independente da opção escolhida, após o deploy:

1.  **Configure o Webhook na Hotmart**:
    *   Pegue a URL pública da sua aplicação (ex: `https://seu-app.onrender.com`).
    *   Na Hotmart, configure o webhook para: `https://seu-app.onrender.com/webhook/hotmart`.
    *   Evento: "Compra Aprovada" (e outros que desejar).

2.  **Verifique os Logs**:
    *   Monitore os logs da aplicação para garantir que ela iniciou corretamente e está conectada ao banco de dados e serviços externos.
