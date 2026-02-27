from app.db import engine
from sqlalchemy import text
import sys

def run_migration():
    print("MIGRATION_STARTING...")
    print(f"DATABASE_URL: {engine.url}")
    try:
        print("MIGRATION_CONNECTING...")
        with engine.begin() as conn:
            print("MIGRATION_CONNECTED. Executing ALTER TABLE...")
            # Set lock timeout so it doesn't hang forever
            conn.execute(text("SET lock_timeout = '2s';"))
            conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;"))
            print("MIGRATION_EXECUTED.")
    except Exception as e:
        print("MIGRATION_ERROR:", str(e))
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
