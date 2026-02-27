from datetime import date
from enum import Enum
from pydantic import BaseModel, EmailStr, field_validator


class Sex(str, Enum):
    male = "male"
    female = "female"


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    athlete = "athlete"


class GoalType(str, Enum):
    cut = "cut"
    maintain = "maintain"
    bulk = "bulk"


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres")
        if not any(char.isalpha() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("A senha deve conter letras e numeros")
        return value


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GoalBase(BaseModel):
    calories: int
    protein: int
    water_ml: int

    @field_validator("calories", "protein", "water_ml")
    @classmethod
    def validate_positive(cls, value: int):
        if value <= 0:
            raise ValueError("O valor deve ser maior que zero")
        return value


class GoalOut(GoalBase):
    id: int

    class Config:
        from_attributes = True


class MealBase(BaseModel):
    date: date
    name: str
    protein: int

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str):
        value = value.strip()
        if not value:
            raise ValueError("O nome nao pode ser vazio")
        return value

    @field_validator("protein")
    @classmethod
    def validate_protein(cls, value: int):
        if value < 0:
            raise ValueError("A proteina nao pode ser negativa")
        return value


class MealOut(MealBase):
    id: int

    class Config:
        from_attributes = True


class WorkoutExerciseBase(BaseModel):
    name: str
    muscle_group: str
    sets: int
    reps: str
    weight_kg: float | None = None


class WorkoutExerciseOut(WorkoutExerciseBase):
    id: int

    class Config:
        from_attributes = True


class WorkoutBase(BaseModel):
    date: date
    name: str
    duration: int
    cardio_minutes: int | None = None
    is_completed: bool = False
    exercises: list[WorkoutExerciseBase] = []

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str):
        value = value.strip()
        if not value:
            raise ValueError("O nome nao pode ser vazio")
        return value

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, value: int):
        if value <= 0:
            raise ValueError("A duracao deve ser maior que zero")
        return value


class WorkoutOut(WorkoutBase):
    id: int
    exercises: list[WorkoutExerciseOut] = []

    class Config:
        from_attributes = True


class SummaryOut(BaseModel):
    date: date
    protein_goal: int
    protein_consumed: int
    water_goal: int | None = None
    water_consumed: int | None = None

class WaterLogBase(BaseModel):
    date: date
    amount_ml: int

    @field_validator("amount_ml")
    @classmethod
    def validate_amount(cls, value: int):
        if value <= 0:
            raise ValueError("O volume de água não pode ser negativo ou zero")
        return value


class WaterLogOut(WaterLogBase):
    id: int

    class Config:
        from_attributes = True


class ProfileBase(BaseModel):
    name: str | None = None
    sex: Sex
    age: int
    height_cm: int
    weight_kg: int
    activity_level: ActivityLevel
    goal: GoalType
    avatar_url: str | None = None

    @field_validator("sex", mode="before")
    @classmethod
    def validate_sex(cls, value: str):
        allowed = {item.value for item in Sex}
        if value not in allowed:
            raise ValueError("Sexo invalido. Use: male ou female")
        return value

    @field_validator("activity_level", mode="before")
    @classmethod
    def validate_activity_level(cls, value: str):
        allowed = {item.value for item in ActivityLevel}
        if value not in allowed:
            raise ValueError("Nivel de atividade invalido")
        return value

    @field_validator("goal", mode="before")
    @classmethod
    def validate_goal(cls, value: str):
        allowed = {item.value for item in GoalType}
        if value not in allowed:
            raise ValueError("Objetivo invalido")
        return value

    @field_validator("age")
    @classmethod
    def validate_age(cls, value: int):
        if value < 10 or value > 120:
            raise ValueError("A idade esta fora do intervalo esperado")
        return value

    @field_validator("height_cm")
    @classmethod
    def validate_height(cls, value: int):
        if value < 100 or value > 250:
            raise ValueError("A altura esta fora do intervalo esperado")
        return value

    @field_validator("weight_kg")
    @classmethod
    def validate_weight(cls, value: int):
        if value < 30 or value > 300:
            raise ValueError("O peso esta fora do intervalo esperado")
        return value


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    sex: Sex | None = None
    age: int | None = None
    height_cm: int | None = None
    weight_kg: int | None = None
    activity_level: ActivityLevel | None = None
    goal: GoalType | None = None

    @field_validator("sex", mode="before")
    @classmethod
    def validate_optional_sex(cls, value: str | None):
        if value is None:
            return value
        allowed = {item.value for item in Sex}
        if value not in allowed:
            raise ValueError("Sexo invalido. Use: male ou female")
        return value

    @field_validator("activity_level", mode="before")
    @classmethod
    def validate_optional_activity_level(cls, value: str | None):
        if value is None:
            return value
        allowed = {item.value for item in ActivityLevel}
        if value not in allowed:
            raise ValueError("Nivel de atividade invalido")
        return value

    @field_validator("goal", mode="before")
    @classmethod
    def validate_optional_goal(cls, value: str | None):
        if value is None:
            return value
        allowed = {item.value for item in GoalType}
        if value not in allowed:
            raise ValueError("Objetivo invalido")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres")
        if not any(char.isalpha() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("A senha deve conter letras e numeros")
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


class DailyWorkoutStat(BaseModel):
    date: date
    minutes: int

class WeeklySummaryOut(BaseModel):
    week_start: date
    week_end: date
    workouts_count: int
    workouts_goal: int
    total_minutes: int
    chart_data: list[DailyWorkoutStat]
