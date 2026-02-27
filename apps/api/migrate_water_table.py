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
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS water_logs (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    date DATE NOT NULL,
                    amount_ml INTEGER NOT NULL
                );
            """))
            print("Success: Created water_logs table")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    main()
