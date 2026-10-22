# 💰 Sistema de Finanças Pessoais

Sistema web para controle de finanças pessoais com receitas, despesas e metas de orçamento.

## Tecnologias

- **Backend:** Python 3.14 + Flask + SQLAlchemy + SQLite
- **Frontend:** React + Vite + TailwindCSS + Recharts

## Como Executar

### 1. Backend (Terminal 1)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

O servidor sobe em: http://localhost:8000

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Acesse o sistema em: **http://localhost:5173**

## Funcionalidades

- 📊 **Dashboard** — gráficos de receitas vs despesas, últimas transações, orçamentos
- 💸 **Transações** — cadastro, edição, exclusão com filtros por mês/categoria
- 🎯 **Orçamentos** — metas mensais por categoria com barra de progresso
- 🏷️ **Categorias** — ícones emoji e cores personalizáveis

## Dados de Exemplo (outubro/2026)

O sistema já vem populado com:
- 10 categorias (receitas e despesas)
- 7 transações de exemplo
- 5 orçamentos mensais
