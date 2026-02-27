from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
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
