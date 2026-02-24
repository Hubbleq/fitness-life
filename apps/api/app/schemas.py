from datetime import date
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("Senha deve ter pelo menos 8 caracteres")
        return value


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GoalBase(BaseModel):
    calories: int
    protein: int


class GoalOut(GoalBase):
    id: int

    class Config:
        from_attributes = True


class MealBase(BaseModel):
    date: date
    name: str
    protein: int


class MealOut(MealBase):
    id: int

    class Config:
        from_attributes = True


class WorkoutBase(BaseModel):
    date: date
    name: str
    duration: int


class WorkoutOut(WorkoutBase):
    id: int

    class Config:
        from_attributes = True


class SummaryOut(BaseModel):
    date: date
    protein_goal: int
    protein_consumed: int


class ProfileBase(BaseModel):
    name: str | None = None
    sex: str  # male|female
    age: int
    height_cm: int
    weight_kg: int
    activity_level: str  # sedentary|light|moderate|active|athlete
    goal: str  # cut|maintain|bulk


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    sex: str | None = None
    age: int | None = None
    height_cm: int | None = None
    weight_kg: int | None = None
    activity_level: str | None = None
    goal: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("Senha deve ter pelo menos 8 caracteres")
        return value


class ProfileOut(ProfileBase):
    id: int

    class Config:
        from_attributes = True


class RecommendationOut(BaseModel):
    calories_target: int
    protein_target: int
    protein_consumed: int
    protein_remaining: int
    bmr: int
    workout_intensity: str
    workout_plan: str
    weekly_workouts_goal: int


class WeeklySummaryOut(BaseModel):
    week_start: date
    week_end: date
    workouts_count: int
    workouts_goal: int
    total_minutes: int
