from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/fitness", tags=["fitness"])


def is_profile_complete(profile: models.Profile | None) -> bool:
    if profile is None:
        return False
    required_fields = ("sex", "age", "height_cm", "weight_kg", "activity_level", "goal")
    return all(getattr(profile, field) is not None for field in required_fields)


def calculate_bmr(sex: str, weight_kg: int, height_cm: int, age: int) -> int:
    if sex.lower() == "female":
        value = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    else:
        value = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    return int(round(value))


def activity_multiplier(level: str) -> float:
    mapping = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "athlete": 1.9,
    }
    return mapping.get(level, 1.2)


def goal_factor(goal: str) -> float:
    mapping = {
        "cut": 0.8,
        "maintain": 1.0,
        "bulk": 1.1,
    }
    return mapping.get(goal, 1.0)


def workout_recommendation(goal: str, activity: str) -> tuple[str, str, int]:
    base_goal = {
        "sedentary": 2,
        "light": 3,
        "moderate": 4,
        "active": 5,
        "athlete": 6,
    }.get(activity, 3)
    if goal == "bulk":
        base_goal += 1

    if goal == "cut":
        intensity = "Moderado"
        plan = "3-5x/sem, foco em cardio + força leve"
    elif goal == "bulk":
        intensity = "Alto (força)"
        plan = "4-6x/sem, foco em musculação e progressão"
    else:
        intensity = "Moderado"
        plan = "3-4x/sem, equilíbrio entre cardio e força"

    return intensity, plan, base_goal


@router.get("/goals", response_model=schemas.GoalOut | None)
def get_goals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()


@router.get("/profile", response_model=schemas.ProfileOut | None)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    return profile if is_profile_complete(profile) else None


@router.put("/profile", response_model=schemas.ProfileOut)
def upsert_profile(
    profile_in: schemas.ProfileBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile is None:
        profile = models.Profile(user_id=current_user.id, **profile_in.dict())
        db.add(profile)
    else:
        for key, value in profile_in.dict().items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/goals", response_model=schemas.GoalOut)
def upsert_goals(
    goal_in: schemas.GoalBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()
    if goal is None:
        goal = models.Goal(user_id=current_user.id, calories=goal_in.calories, protein=goal_in.protein)
        db.add(goal)
    else:
        goal.calories = goal_in.calories
        goal.protein = goal_in.protein
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/meals", response_model=schemas.MealOut)
def create_meal(
    meal_in: schemas.MealBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meal = models.Meal(user_id=current_user.id, **meal_in.dict())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.put("/meals/{meal_id}", response_model=schemas.MealOut)
def update_meal(
    meal_id: int,
    meal_in: schemas.MealBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meal = (
        db.query(models.Meal)
        .filter(models.Meal.id == meal_id, models.Meal.user_id == current_user.id)
        .first()
    )
    if meal is None:
        raise HTTPException(status_code=404, detail="Refeição não encontrada")

    meal.date = meal_in.date
    meal.name = meal_in.name
    meal.protein = meal_in.protein
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/meals", response_model=list[schemas.MealOut])
def list_meals(
    date: date | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Meal).filter(models.Meal.user_id == current_user.id)
    if date:
        query = query.filter(models.Meal.date == date)
    return query.order_by(models.Meal.date.desc()).all()


@router.post("/workouts", response_model=schemas.WorkoutOut)
def create_workout(
    workout_in: schemas.WorkoutBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = models.Workout(user_id=current_user.id, **workout_in.dict())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.put("/workouts/{workout_id}", response_model=schemas.WorkoutOut)
def update_workout(
    workout_id: int,
    workout_in: schemas.WorkoutBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = (
        db.query(models.Workout)
        .filter(models.Workout.id == workout_id, models.Workout.user_id == current_user.id)
        .first()
    )
    if workout is None:
        raise HTTPException(status_code=404, detail="Treino não encontrado")

    workout.date = workout_in.date
    workout.name = workout_in.name
    workout.duration = workout_in.duration
    db.commit()
    db.refresh(workout)
    return workout


@router.get("/workouts", response_model=list[schemas.WorkoutOut])
def list_workouts(
    date: date | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Workout).filter(models.Workout.user_id == current_user.id)
    if date:
        query = query.filter(models.Workout.date == date)
    return query.order_by(models.Workout.date.desc()).all()


@router.get("/summary", response_model=schemas.SummaryOut)
def summary(
    date: date,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).first()
    if goal is None:
        raise HTTPException(status_code=400, detail="Set goals first")

    total_protein = (
        db.query(func.coalesce(func.sum(models.Meal.protein), 0))
        .filter(models.Meal.user_id == current_user.id, models.Meal.date == date)
        .scalar()
    )

    return schemas.SummaryOut(
        date=date,
        protein_goal=goal.protein,
        protein_consumed=int(total_protein),
    )


@router.get("/recommendations", response_model=schemas.RecommendationOut)
def recommendations(
    date: date,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not is_profile_complete(profile):
        raise HTTPException(status_code=400, detail="Preencha o perfil primeiro")

    bmr = calculate_bmr(profile.sex, profile.weight_kg, profile.height_cm, profile.age)
    calories_target = int(round(bmr * activity_multiplier(profile.activity_level) * goal_factor(profile.goal)))

    protein_factor = 2.0 if profile.goal in ("cut", "bulk") else 1.6
    protein_target = int(round(profile.weight_kg * protein_factor))

    total_protein = (
        db.query(func.coalesce(func.sum(models.Meal.protein), 0))
        .filter(models.Meal.user_id == current_user.id, models.Meal.date == date)
        .scalar()
    )

    protein_consumed = int(total_protein)
    protein_remaining = max(protein_target - protein_consumed, 0)

    intensity, plan, weekly_goal = workout_recommendation(profile.goal, profile.activity_level)

    return schemas.RecommendationOut(
        calories_target=calories_target,
        protein_target=protein_target,
        protein_consumed=protein_consumed,
        protein_remaining=protein_remaining,
        bmr=bmr,
        workout_intensity=intensity,
        workout_plan=plan,
        weekly_workouts_goal=weekly_goal,
    )


@router.get("/weekly-summary", response_model=schemas.WeeklySummaryOut)
def weekly_summary(
    week_start: date,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    week_end = week_start.fromordinal(week_start.toordinal() + 6)
    workouts = (
        db.query(models.Workout)
        .filter(
            models.Workout.user_id == current_user.id,
            models.Workout.date >= week_start,
            models.Workout.date <= week_end,
        )
        .all()
    )
    workouts_count = len(workouts)
    total_minutes = sum(w.duration for w in workouts)

    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not is_profile_complete(profile):
        raise HTTPException(status_code=400, detail="Preencha o perfil primeiro")

    _, _, weekly_goal = workout_recommendation(profile.goal, profile.activity_level)

    return schemas.WeeklySummaryOut(
        week_start=week_start,
        week_end=week_end,
        workouts_count=workouts_count,
        workouts_goal=weekly_goal,
        total_minutes=total_minutes,
    )
