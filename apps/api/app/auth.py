import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from .db import get_db
from . import models

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    if ENVIRONMENT == "development":
        JWT_SECRET = "dev-secret"
    else:
        raise RuntimeError("JWT_SECRET is not set")

if ENVIRONMENT != "development" and len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET must be at least 32 characters in production")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def set_rls_context(db: Session, email: str) -> None:
    """
    Set the RLS context for the current database session.
    This allows Row Level Security policies to filter data by user.

    Args:
        db: Database session
        email: User's email from JWT token
    """
    # Escape single quotes to prevent SQL injection
    safe_email = email.replace("'", "''")
    db.execute(text(f"SET request.jwt.claims = '{{\"sub\": \"{safe_email}\"}}'"))


def get_db_with_rls(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Session:
    """
    Dependency that sets RLS context before returning the db session.
    Use this instead of get_db when RLS is enabled on the database.

    Usage:
        @router.get("/meals")
        def list_meals(db: Session = Depends(get_db_with_rls)):
            # RLS is now active, queries will be filtered by user
            return db.query(Meal).all()
    """
    set_rls_context(db, current_user.email)
    return db


def set_rls_context(db: Session, email: str) -> None:
    """
    Set the Row Level Security context for the current database session.
    This allows RLS policies to filter data based on the authenticated user.

    Args:
        db: SQLAlchemy session
        email: User's email from the JWT token
    """
    # Escape single quotes to prevent SQL injection
    safe_email = email.replace("'", "''")
    db.execute(text(f"SET request.jwt.claims = '{{\"sub\": \"{safe_email}\"}}'"))


def get_db_with_rls(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Session:
    """
    Dependency that sets RLS context before returning the db session.
    Use this instead of get_db when you want RLS policies to be enforced.

    Example:
        @router.get("/meals")
        def list_meals(db: Session = Depends(get_db_with_rls)):
            # RLS is now active - queries will be filtered by user
            return db.query(Meal).all()
    """
    set_rls_context(db, current_user.email)
    return db


def get_current_user_with_rls(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> tuple[models.User, Session]:
    """
    Dependency that returns both the current user and a db session with RLS context set.
    Useful when you need both the user object and RLS-protected database access.

    Example:
        @router.get("/meals")
        def list_meals(current_user: User, db: Session = Depends(get_current_user_with_rls)):
            # Both user and RLS context are available
            return db.query(Meal).all()
    """
    user = get_current_user(credentials, db)
    set_rls_context(db, user.email)
    return user, db
