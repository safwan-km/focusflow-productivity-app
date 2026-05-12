import sys
from database import engine
from sqlalchemy import text

def run_migration(filename):
    filepath = f"../migrations/{filename}"
    try:
        with open(filepath, 'r') as f:
            sql = f.read()
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        print(f"✅ Migration '{filename}' ran successfully!")
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate.py <migration_filename>")
        print("Example: python migrate.py 002_add_name_to_users.sql")
    else:
        run_migration(sys.argv[1])