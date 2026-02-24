from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

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

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}
