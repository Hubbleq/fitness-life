import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/chat", tags=["chat"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

SYSTEM_PROMPT = """Você é o assistente virtual super inteligente do app Fitness Hub. Você é especialista em exercícios, musculação, nutrição, hipertrofia e emagrecimento.
Responda de forma proativa, direta e prática o que o usuário perguntar. 
Se ele pedir sugestões de suplementação escolar, dê as respostas como um especialista (ex: citar as melhores marcas, posologias como creatina, whey, pré-treino). Se pedir dicas gerais de como melhorar em algo, ajude-o com as melhores informações científicas e de senso comum avançado da musculação atual! NÃO NEGUE AJUDA DENTRO DESSES TÓPICOS!
CRÍTICO: Ao sugerir treinos textualmente nos bate-papos, liste apenas Músculo Alvo, Nome do Exercício, Séries e Repetições. NUNCA sugira a carga (pesos), deixe isso para o usuário informar quando for registrar."""


class ChatRequest(BaseModel):
    message: str


@router.post("")
async def chat_groq(
    req: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not GROQ_API_KEY:
        return {"message": "Chave da API Groq não configurada. Adicione GROQ_API_KEY no .env."}

    # Fetch User Context
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()
    recent_meals = db.query(models.Meal).filter(models.Meal.user_id == current_user.id).order_by(models.Meal.date.desc()).limit(5).all()
    recent_workouts = db.query(models.Workout).filter(models.Workout.user_id == current_user.id).order_by(models.Workout.date.desc()).limit(5).all()
    
    context_parts = []
    if profile:
        context_parts.append(f"Perfil: {profile.age} anos, {profile.sex}, {profile.weight_kg}kg, {profile.height_cm}cm, Objetivo: {profile.goal}, Atividade: {profile.activity_level}.")
    if goal:
        context_parts.append(f"Metas Diárias: {goal.calories} kcal, {goal.protein}g proteína.")
    if recent_meals:
        meals_str = ", ".join([f"{m.name} ({m.protein}g PTN)" for m in recent_meals])
        context_parts.append(f"Últimas refeições registradas: {meals_str}.")
    if recent_workouts:
        workouts_str = ", ".join([f"{w.name} ({w.duration} min)" for w in recent_workouts])
        context_parts.append(f"Últimos treinos registrados: {workouts_str}.")
        
    user_context = "\n".join(context_parts) if context_parts else "Nenhum dado de perfil/histórico registrado ainda."
    
    dynamic_prompt = f"{SYSTEM_PROMPT}\n\n[CONTEXTO DO USUÁRIO]\n{user_context}\nUse este contexto para fazer recomendações hiperpersonalizadas."

    try:
        from groq import Groq
        import json

        client = Groq(api_key=GROQ_API_KEY)
        
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_workout",
                    "description": "APENAS chame esta função quando o usuário EXPLICITAMENTE pedir para adicionar, registrar ou salvar um treino no diário. NÃO chame se ele estiver apenas pedindo dicas, para montar um treino, ou perguntando sobre exercícios.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "Nome do treino geral (ex: Treino de Peito)"},
                            "duration": {"type": "integer", "description": "Duração total estimada em minutos"},
                            "cardio_minutes": {"type": "integer", "description": "Quantos minutos de cardio foram feitos (ex: 15, 20). 0 se nenhum."},
                            "exercises": {
                                "type": "array",
                                "description": "Lista de exercícios de musculação feitos no treino",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string", "description": "Nome do exercício (ex: Supino, Puxada)"},
                                        "muscle_group": {"type": "string", "description": "Grupo muscular alvo principal (ex: Peitoral, Costas, Ombro, Perna)"},
                                        "sets": {"type": "integer", "description": "Número de séries (sets)"},
                                        "reps": {"type": "string", "description": "Número de repetições em string (ex: '10', '10-12', 'Até a falha')"},
                                        "weight_kg": {"type": "number", "description": "Peso levantado em kg. Opcional. 0 se não informado."}
                                    },
                                    "required": ["name", "muscle_group", "sets", "reps"]
                                }
                            }
                        },
                        "required": ["name", "duration", "exercises"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_meal",
                    "description": "APENAS chame esta função quando o usuário EXPLICITAMENTE pedir para adicionar, registrar ou salvar uma refeição no diário. NÃO chame se ele estiver pedindo dicas de dieta ou receitas.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "Nome da refeição (ex: Almoço)"},
                            "description": {"type": "string", "description": "O que comeu (ex: Frango com batata)"},
                            "calories": {"type": "integer"},
                            "protein": {"type": "integer"}
                        },
                        "required": ["name", "calories", "protein"]
                    }
                }
            }
        ]
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": dynamic_prompt,
                },
                {
                    "role": "user",
                    "content": req.message,
                }
            ],
            # Usando o modelo Llama 3.3 70B (muito mais inteligente e preciso)
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
            tools=tools
        )
        
        msg = chat_completion.choices[0].message
        
        # Check if model wants to call a tool
        if msg.tool_calls:
            tool_call = msg.tool_calls[0]
            action = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            
            # The AI decided to call a tool. We will return a special response instructing the frontend.
            if action == "add_workout":
                return {
                    "message": f"Entendi! Quer que eu registre um '{args.get('name')}' com duração de {args.get('duration')} min?",
                    "suggested_action": {"type": "create_workout", "payload": args}
                }
            elif action == "add_meal":
                return {
                    "message": f"Quer registrar: {args.get('name')} ({args.get('calories')} kcal, {args.get('protein')}g de proteína)?",
                    "suggested_action": {"type": "create_meal", "payload": args}
                }

        return {"message": msg.content}

    except ImportError:
        return {"message": "SDK do Groq não instalada. Rode: pip install groq"}
    except Exception as e:
        return {"message": f"Erro ao consultar Groq: {str(e)}"}
