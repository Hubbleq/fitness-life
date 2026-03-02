"""
Public catalog endpoints - No authentication required.
These endpoints provide read-only access to exercise and meal catalogs.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..db import get_db
from .. import models

router = APIRouter(prefix="/catalog", tags=["catalog"])


# ============================================================================
# EXERCISES CATALOG
# ============================================================================

@router.get("/exercises")
def list_exercises(
    muscle_group: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    List exercises from the public catalog.
    No authentication required.
    """
    query = db.query(models.ExerciseCatalog)

    if muscle_group:
        query = query.filter(models.ExerciseCatalog.muscle_group.ilike(f"%{muscle_group}%"))

    if difficulty:
        query = query.filter(models.ExerciseCatalog.difficulty == difficulty)

    return query.order_by(models.ExerciseCatalog.name).limit(limit).all()


@router.get("/exercises/{exercise_id}")
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific exercise by ID."""
    exercise = db.query(models.ExerciseCatalog).filter(
        models.ExerciseCatalog.id == exercise_id
    ).first()

    if not exercise:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Exercise not found")

    return exercise


@router.get("/exercises/muscle-groups")
def list_muscle_groups(db: Session = Depends(get_db)):
    """List all available muscle groups."""
    from sqlalchemy import func
    result = db.query(
        models.ExerciseCatalog.muscle_group,
        func.count(models.ExerciseCatalog.id).label("count")
    ).group_by(models.ExerciseCatalog.muscle_group).all()

    return [{"muscle_group": r.muscle_group, "count": r.count} for r in result]


# ============================================================================
# MEALS CATALOG
# ============================================================================

@router.get("/meals")
def list_meals_catalog(
    category: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    List meals from the public catalog.
    No authentication required.
    """
    query = db.query(models.MealCatalog)

    if category:
        query = query.filter(models.MealCatalog.category.ilike(f"%{category}%"))

    return query.order_by(models.MealCatalog.name).limit(limit).all()


@router.get("/meals/{meal_id}")
def get_meal_catalog(
    meal_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific meal from catalog by ID."""
    meal = db.query(models.MealCatalog).filter(
        models.MealCatalog.id == meal_id
    ).first()

    if not meal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Meal not found")

    return meal


@router.get("/meals/categories")
def list_meal_categories(db: Session = Depends(get_db)):
    """List all available meal categories."""
    from sqlalchemy import func
    result = db.query(
        models.MealCatalog.category,
        func.count(models.MealCatalog.id).label("count")
    ).group_by(models.MealCatalog.category).all()

    return [{"category": r.category, "count": r.count} for r in result]


# ============================================================================
# WORKOUT TEMPLATES
# ============================================================================

@router.get("/workout-templates")
def list_workout_templates(
    goal: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    List workout templates from the public catalog.
    No authentication required.
    """
    query = db.query(models.WorkoutTemplate)

    if goal:
        query = query.filter(models.WorkoutTemplate.goal.ilike(f"%{goal}%"))

    if difficulty:
        query = query.filter(models.WorkoutTemplate.difficulty == difficulty)

    return query.order_by(models.WorkoutTemplate.name).limit(limit).all()


@router.get("/workout-templates/{template_id}")
def get_workout_template(
    template_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific workout template with exercises."""
    from sqlalchemy.orm import joinedload

    template = db.query(models.WorkoutTemplate).options(
        joinedload(models.WorkoutTemplate.template_exercises)
    ).filter(
        models.WorkoutTemplate.id == template_id
    ).first()

    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")

    return template