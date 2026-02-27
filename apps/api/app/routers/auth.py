import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token
from ..limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])
REGISTER_RATE_LIMIT = os.getenv("RATE_LIMIT_REGISTER", "3/minute")
LOGIN_RATE_LIMIT = os.getenv("RATE_LIMIT_LOGIN", "5/minute")


@router.post("/register", response_model=schemas.Token)
@limiter.limit(REGISTER_RATE_LIMIT)
def register(request: Request, user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nao foi possivel registrar")

    user = models.User(email=user_in.email, hashed_password=hash_password(user_in.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    profile_fields = [
        user_in.name,
        user_in.sex,
        user_in.age,
        user_in.height_cm,
        user_in.weight_kg,
        user_in.activity_level,
        user_in.goal,
    ]
    if any(field is not None for field in profile_fields):
        if any(field is None for field in profile_fields):
            raise HTTPException(status_code=400, detail="Perfil incompleto")
        profile = models.Profile(
            user_id=user.id,
            name=user_in.name,
            sex=user_in.sex,
            age=user_in.age,
            height_cm=user_in.height_cm,
            weight_kg=user_in.weight_kg,
            activity_level=user_in.activity_level,
            goal=user_in.goal,
        )
        db.add(profile)
        db.commit()

        # Calcula agua
        age = user_in.age
        weight = user_in.weight_kg
        if age <= 30:
            water_ml = int(40 * weight)
        elif age <= 55:
            water_ml = int(35 * weight)
        elif age <= 65:
            water_ml = int(30 * weight)
        else:
            water_ml = int(25 * weight)
            
        # Calcula calorias e proteina
        if user_in.sex == "male":
            bmr = 88.362 + (13.397 * weight) + (4.799 * user_in.height_cm) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * user_in.height_cm) - (4.330 * age)
            
        act_mult = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "athlete": 1.9}
        goal_mult = {"cut": 0.8, "maintain": 1.0, "bulk": 1.15}
        
        calories = int(bmr * act_mult.get(user_in.activity_level, 1.2) * goal_mult.get(user_in.goal, 1.0))
        protein = int(weight * (1.6 if user_in.goal == "maintain" else 2.0))

        goal_obj = models.Goal(
            user_id=user.id,
            calories=calories,
            protein=protein,
            water_ml=water_ml
        )
        db.add(goal_obj)
        db.commit()
    else:
        # Default profile for fast registrations
        profile = models.Profile(
            user_id=user.id,
            name=user_in.name,
            sex="male",
            age=25,
            height_cm=175,
            weight_kg=75,
            activity_level="moderate",
            goal="maintain",
        )
        db.add(profile)
        goal_obj = models.Goal(
            user_id=user.id,
            calories=2500,
            protein=150,
            water_ml=2500
        )
        db.add(goal_obj)
        db.commit()

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
@limiter.limit(LOGIN_RATE_LIMIT)
def login(request: Request, user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais invalidas")

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}
