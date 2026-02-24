# fitness-life

Aplicativo para organizar a rotina fitness em um só lugar. O projeto reúne um backend em FastAPI e um frontend em Next.js para registrar metas, refeições e treinos, além de oferecer um chat simples para apoio ao acompanhamento.

## O que este projeto entrega

- Cadastro e login de usuários
- Metas fitness (consulta e atualização)
- Registro e listagem de refeições e treinos
- Resumo diário por data
- Chat para conversas rápidas relacionadas ao plano fitness

## Tecnologias

- Backend: FastAPI
- Frontend: Next.js (App Router)
- Banco: PostgreSQL (com fallback para SQLite em desenvolvimento)

## Estrutura do monorepo

- `apps/api`: API FastAPI
- `apps/web`: Web app Next.js

## Como rodar o backend (API)

1. Configure as variáveis em um arquivo `.env` na raiz (use o `.env.example` como base).
2. Crie um ambiente virtual e instale as dependências.
3. Suba o servidor:

```bash
cd apps/api
pip install -e .
uvicorn app.main:app --reload
```

Se você não tiver PostgreSQL configurado, o backend usa SQLite local automaticamente (arquivo `dev.db`).

## Como rodar o frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

Abra: http://localhost:3000

## Endpoints principais da API

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET/PUT /fitness/goals`
- `POST/GET /fitness/meals`
- `POST/GET /fitness/workouts`
- `GET /fitness/summary?date=YYYY-MM-DD`
- `POST /chat`

## Banco e migracoes

As migracoes estao em [apps/api/migrations](apps/api/migrations). Em producao, recomenda-se usar PostgreSQL com variaveis de ambiente configuradas no `.env`.

## Proximos passos sugeridos

- Regras de senha e validacao de e-mail mais detalhadas
- Paginacao e filtros para refeicoes e treinos
- Integracao real no chat
- Testes basicos para autenticacao e rotas de fitness
