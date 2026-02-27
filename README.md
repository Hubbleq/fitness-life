# 🏋️ Fitness Hub

Aplicativo completo para organizar sua rotina fitness em um só lugar. Registre treinos, refeições, metas e acompanhe sua evolução com suporte de IA.

## ✨ Funcionalidades

- **Cadastro inteligente** — Fluxo guiado com cálculo automático de TMB, meta calórica, proteína e hidratação
- **Dashboard interativo** — Resumo diário com anéis de progresso (calorias, proteína, água)
- **Registro de Treinos** — Cadastre exercícios com séries, repetições e carga. Marque como concluído com toggle deslizante
- **Registro de Refeições** — Registre suas refeições do dia com macros detalhados
- **Sugestão com IA** — Gere treinos e refeições personalizados com base no seu perfil e histórico
- **Chat com IA** — Assistente fitness especialista que responde sobre suplementação, pré-treino, dietas e mais
- **Controle de Água** — Registre copos de água e acompanhe sua hidratação diária
- **Landing Page moderna** — Página de apresentação responsiva com design premium

## 🛠️ Tecnologias

| Camada    | Stack                                      |
|-----------|---------------------------------------------|
| Backend   | FastAPI, SQLAlchemy, Pydantic, Groq AI      |
| Frontend  | Next.js 14 (App Router), React, CSS puro    |
| Banco     | PostgreSQL (Supabase) / SQLite (dev local)  |
| IA        | Groq (LLaMA / Mixtral)                      |

## 📁 Estrutura do Monorepo

```
fitness-life/
├── apps/
│   ├── api/          # Backend FastAPI
│   │   ├── app/
│   │   │   ├── routers/   # auth, fitness, chat
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   └── main.py
│   │   └── .env
│   └── web/          # Frontend Next.js
│       └── src/app/
│           ├── (marketing)/   # Landing page
│           ├── (public)/      # Login / Registro
│           └── (app)/         # Dashboard, Treinos, Refeições, Metas, Chat
└── README.md
```

## 🚀 Como rodar

### Backend (API)

```bash
cd apps/api
pip install -e .
py -m uvicorn app.main:app --reload --port 8000
```

### Frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

Acesse: **http://localhost:3000**

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` em `apps/api/`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:SENHA@db.xxxxx.supabase.co:5432/postgres
DATABASE_SSL=true
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxx
```

> Sem PostgreSQL? O backend usa SQLite local automaticamente (`dev.db`).

## 🔌 Endpoints da API

| Método | Rota                         | Descrição                      |
|--------|------------------------------|--------------------------------|
| GET    | `/health`                    | Health check                   |
| POST   | `/auth/register`             | Cadastro de usuário            |
| POST   | `/auth/login`                | Login (JWT)                    |
| GET    | `/fitness/goals`             | Consultar metas                |
| PUT    | `/fitness/goals`             | Atualizar metas                |
| POST   | `/fitness/meals`             | Criar refeição                 |
| GET    | `/fitness/meals`             | Listar refeições               |
| POST   | `/fitness/workouts`          | Criar treino                   |
| GET    | `/fitness/workouts`          | Listar treinos                 |
| PUT    | `/fitness/workouts/{id}`     | Atualizar treino               |
| DELETE | `/fitness/workouts/{id}`     | Excluir treino                 |
| POST   | `/fitness/water`             | Registrar água                 |
| GET    | `/fitness/summary`           | Resumo diário                  |
| POST   | `/fitness/ai/suggest-workout`| Sugestão de treino com IA      |
| POST   | `/fitness/ai/suggest-meal`   | Sugestão de refeição com IA    |
| POST   | `/chat`                      | Chat com assistente IA         |

## 📸 Páginas

- **Landing Page** — Apresentação com hero, features e CTA
- **Login / Registro** — Fluxo com cálculo de TMB e metas
- **Dashboard** — Anéis de progresso + controle de água
- **Treinos** — Listagem com toggle de conclusão + sugestão IA
- **Refeições** — Registro com macros + sugestão IA
- **Metas** — Edição de objetivos e nível de atividade
- **Chat IA** — Assistente especialista em fitness

## 📄 Licença

© 2026 Fitness Life. Todos os direitos reservados.
