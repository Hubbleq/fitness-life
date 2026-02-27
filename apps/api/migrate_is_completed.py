import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def main():
    if not DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    try:
        engine = create_engine(DATABASE_URL)
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE workouts ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE;"))
            print("Success: Added is_completed to workouts table")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    main()
