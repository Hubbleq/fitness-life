import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv(override=True)
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("NO DB URL")
    sys.exit(1)

# Supabase DDL best works directly on session pooler. We can try raw connection
try:
    print("Connecting...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    print("Connected. Getting cursor...")
    with conn.cursor() as cur:
        print("Executing ALTER...")
        cur.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;")
        print("ALTER done.")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()
    print("FINISHED")
