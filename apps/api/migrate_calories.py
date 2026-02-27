import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def run_migration():
    clean_url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://")
    print(f"Direct connection to {clean_url} for alter table calories...")
    conn = psycopg2.connect(clean_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE meals ADD COLUMN calories INTEGER DEFAULT 0;")
        print("Successfully added calories column to meals.")
    except Exception as e:
        print(f"Error executing migration: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
