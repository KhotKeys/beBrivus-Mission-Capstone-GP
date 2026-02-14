import sqlite3
import os

# Connect to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Update submitted to clicked
cursor.execute("UPDATE applications SET status='clicked' WHERE status='submitted'")
affected = cursor.rowcount

# Commit changes
conn.commit()
conn.close()

print(f"✅ Successfully updated {affected} application(s) from 'submitted' to 'clicked'")
