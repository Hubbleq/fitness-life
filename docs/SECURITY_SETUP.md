# Guia de Segurança - Supabase RLS

## 📋 Resumo das Mudanças

| Arquivo | Descrição |
|---------|-----------|
| `migrations/2026-03-02_security_rls_policies.sql` | Script principal com RLS e políticas |
| `migrations/2026-03-02_verify_rls.sql` | Script de verificação |
| `app/auth.py` | Adicionada função `set_rls_context()` e dependência `get_db_with_rls` |
| `app/models.py` | Adicionados modelos de catálogo público |
| `app/routers/catalog.py` | Novo router para endpoints públicos |
| `app/main.py` | Registrado router de catálogo |

---

## 🚀 Como Aplicar

### Passo 1: Execute o Script SQL no Supabase
1. Acesse [supabase.com](https://supabase.com) e selecione seu projeto
2. Vá em **SQL Editor** no menu lateral
3. Crie uma nova query
4. Cole o conteúdo de `migrations/2026-03-02_security_rls_policies.sql`
5. Clique em **Run** (Ctrl+Enter)

### Passo 2: Verifique se Funcionou
Execute o script `migrations/2026-03-02_verify_rls.sql` para verificar:
- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas criadas corretamente
- ✅ Funções auxiliares funcionando
- ✅ Catálogos públicos acessíveis

### Passo 3: Reinicie o Backend
```bash
cd apps/api
# Se estiver usando uvicorn
uvicorn app.main:app --reload
```

---

## 📚 Novos Endpoints Públicos

### Catálogo de Exercícios
```
GET /catalog/exercises              # Lista exercícios
GET /catalog/exercises/{id}         # Detalhes de um exercício
GET /catalog/exercises/muscle-groups # Lista grupos musculares
```

### Catálogo de Refeições
```
GET /catalog/meals              # Lista refeições
GET /catalog/meals/{id}         # Detalhes de uma refeição
GET /catalog/meals/categories   # Lista categorias
```

### Templates de Treino
```
GET /catalog/workout-templates          # Lista templates
GET /catalog/workout-templates/{id}     # Detalhes de um template
```

**Todos os endpoints acima funcionam SEM autenticação!**

---

## 🔐 Como o RLS Funciona

### O Problema
O Supabase usa `auth.uid()` do Supabase Auth, mas seu projeto usa JWT customizado.

### A Solução
Criamos funções que extraem o usuário do JWT:

```sql
-- Extrai email do JWT (claim 'sub')
auth.jwt_email()

-- Busca user_id pelo email
auth.current_user_id()
```

### No Backend
O contexto RLS é configurado automaticamente pela dependência `get_db_with_rls`:

```python
# Já implementado em auth.py
def get_db_with_rls(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Session:
    set_rls_context(db, current_user.email)
    return db
```

**Uso:**
```python
@router.get("/meals")
def list_meals(db: Session = Depends(get_db_with_rls)):
    # RLS ativo - retorna apenas dados do usuário logado
    return db.query(Meal).all()  # Não precisa de filter(user_id=...)
```

---

## 📊 Tabelas: Público vs Privado

### 🔒 Privadas (Autenticação Obrigatória)
| Tabela | Dados |
|--------|-------|
| `users` | Email, senha hash |
| `profiles` | Nome, idade, peso, altura |
| `goals` | Metas calóricas |
| `meals` | Histórico alimentar |
| `workouts` | Treinos realizados |
| `workout_exercises` | Exercícios dos treinos |
| `water_logs` | Consumo de água |

### 🌐 Públicas (Sem Autenticação)
| Tabela | Uso |
|--------|-----|
| `exercises_catalog` | Exercícios disponíveis |
| `meals_catalog` | Alimentos e refeições |
| `workout_templates` | Modelos de treino |

---

## ⚙️ Configurações do Supabase Dashboard

### Authentication > Providers
- [ ] Desabilite providers não utilizados (Google, GitHub, etc.)

### Settings > API
- [ ] Revogue chave `anon` (se não usa Supabase client)
- [x] Mantenha `service_role` para o backend

### Storage (Opcional)
1. Crie bucket `avatars`
2. Marque como **não público**
3. Políticas já estão no script SQL

---

## ✅ Checklist Final

- [ ] Executou `2026-03-02_security_rls_policies.sql` no Supabase
- [ ] Executou `2026-03-02_verify_rls.sql` para verificar
- [ ] Reiniciou o backend
- [ ] Testou endpoints de catálogo (`GET /catalog/exercises`)
- [ ] Testou que dados privados são bloqueados sem auth
- [ ] Criou bucket `avatars` (se for usar)