from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    goals = relationship("Goal", back_populates="user", uselist=False)
    profile = relationship("Profile", back_populates="user", uselist=False)
    meals = relationship("Meal", back_populates="user")
    workouts = relationship("Workout", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=True)
    sex = Column(String, nullable=False)  # male|female
    age = Column(Integer, nullable=False)
    height_cm = Column(Integer, nullable=False)
    weight_kg = Column(Integer, nullable=False)
    activity_level = Column(String, nullable=False)  # sedentary|light|moderate|active|athlete
    goal = Column(String, nullable=False)  # cut|maintain|bulk
    avatar_url = Column(String, nullable=True)
    health_conditions = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    calories = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    water_ml = Column(Integer, nullable=False, default=2000)

    user = relationship("User", back_populates="goals")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, index=True)
    name = Column(String, index=True)
    protein = Column(Integer)
    calories = Column(Integer, default=0)

    user = relationship("User", back_populates="meals")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    name = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    cardio_minutes = Column(Integer, nullable=True)
    is_completed = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="workouts")
    exercises = relationship("WorkoutExercise", back_populates="workout", cascade="all, delete-orphan")


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    name = Column(String, nullable=False)
    muscle_group = Column(String, nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(String, nullable=False)
    weight_kg = Column(Integer, nullable=True)

    workout = relationship("Workout", back_populates="exercises")

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    amount_ml = Column(Integer, nullable=False)

    user = relationship("User")


# ============================================================================
# PUBLIC CATALOG MODELS (No sensitive user data)
# ============================================================================

class ExerciseCatalog(Base):
    """Public catalog of exercises - readable without authentication."""
    __tablename__ = "exercises_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    muscle_group = Column(String(50), nullable=False)
    equipment = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    difficulty = Column(String(20), default="intermediate")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class MealCatalog(Base):
    """Public catalog of meals/foods - readable without authentication."""
    __tablename__ = "meals_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    calories = Column(Integer, nullable=True)
    protein = Column(Integer, nullable=True)
    carbs = Column(Integer, nullable=True)
    fat = Column(Integer, nullable=True)
    serving_size = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class WorkoutTemplate(Base):
    """Public workout templates - readable without authentication."""
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(20), default="intermediate")
    duration_minutes = Column(Integer, nullable=True)
    goal = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    template_exercises = relationship("WorkoutTemplateExercise", back_populates="template", cascade="all, delete-orphan")


class WorkoutTemplateExercise(Base):
    """Exercises within a workout template."""
    __tablename__ = "workout_template_exercises"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises_catalog.id"), nullable=True)
    sets = Column(Integer, nullable=True)
    reps = Column(String(50), nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    order_index = Column(Integer, default=0)

    template = relationship("WorkoutTemplate", back_populates="template_exercises")
    exercise = relationship("ExerciseCatalog")


# ============================================================================
# PUBLIC CATALOG MODELS (No user data)
# ============================================================================

class ExerciseCatalog(Base):
    """Public catalog of exercises - no authentication required to read"""
    __tablename__ = "exercises_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    muscle_group = Column(String(50), nullable=False)
    equipment = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    difficulty = Column(String(20), default='intermediate')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class MealCatalog(Base):
    """Public catalog of meals - no authentication required to read"""
    __tablename__ = "meals_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    calories = Column(Integer, nullable=True)
    protein = Column(Integer, nullable=True)
    carbs = Column(Integer, nullable=True)
    fat = Column(Integer, nullable=True)
    serving_size = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class WorkoutTemplate(Base):
    """Public workout templates - no authentication required to read"""
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(20), default='intermediate')
    duration_minutes = Column(Integer, nullable=True)
    goal = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    template_exercises = relationship("WorkoutTemplateExercise", back_populates="template", cascade="all, delete-orphan")


class WorkoutTemplateExercise(Base):
    """Exercises within a workout template"""
    __tablename__ = "workout_template_exercises"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises_catalog.id"), nullable=True)
    sets = Column(Integer, nullable=True)
    reps = Column(String(50), nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    order_index = Column(Integer, nullable=True)

    template = relationship("WorkoutTemplate", back_populates="template_exercises")
    exercise = relationship("ExerciseCatalog")
