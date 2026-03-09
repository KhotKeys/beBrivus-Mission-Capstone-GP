import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

cursor.execute('SELECT COUNT(*) FROM resources_resource')
total = cursor.fetchone()[0]
print(f'Total resources: {total}')

if total > 0:
    cursor.execute('SELECT id, title, resource_type, is_published FROM resources_resource LIMIT 10')
    print('\nSample resources:')
    for row in cursor.fetchall():
        print(f'  ID: {row[0]}, Title: {row[1]}, Type: {row[2]}, Published: {row[3]}')

conn.close()
