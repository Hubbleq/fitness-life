import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv(override=True)
db_url = os.getenv("DATABASE_URL")

if db_url:
    # Supabase DDL best works directly on session pooler. We can try raw connection
    try:
        print("Connecting to PostgreSQL...")
        if db_url.startswith("postgresql+psycopg2://"):
            db_url = db_url.replace("postgresql+psycopg2://", "postgresql://")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        print("Connected. Getting cursor...")
        with conn.cursor() as cur:
            print("Executing ALTER...")
            cur.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS health_conditions VARCHAR;")
            print("ALTER done.")
    except Exception as e:
        print(f"PostgreSQL Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()
        print("FINISHED PostgreSQL")

# Also run for local SQLite database if it exists
try:
    import sqlite3
    db_path = "dev.db"
    if os.path.exists(db_path):
        print(f"Connecting to SQLite ({db_path})...")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        print("Executing ALTER on SQLite...")
        # SQLite doesn't support IF NOT EXISTS for ADD COLUMN natively in all versions,
        # but modern versions do. Let's wrap it in a try-except to handle duplicates.
        try:
            cur.execute("ALTER TABLE profiles ADD COLUMN health_conditions VARCHAR;")
            conn.commit()
            print("ALTER on SQLite done.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("Column health_conditions already exists in SQLite.")
            else:
                print(f"SQLite ALTER Error: {e}")
    else:
        print(f"SQLite database {db_path} not found.")
except Exception as e:
    print(f"SQLite Error: {e}")
finally:
    if 'conn' in locals() and isinstance(conn, sqlite3.Connection):
        conn.close()
    print("FINISHED SQLite")
