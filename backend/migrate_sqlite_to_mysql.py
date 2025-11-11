import sqlite3
import mysql.connector

# === CONFIGURATION ===
SQLITE_DB = "xrp.db"
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "FRACAS@22"
MYSQL_DATABASE = "prices"  # your target MySQL DB name

# === CONNECT TO DATABASES ===
sqlite_conn = sqlite3.connect(SQLITE_DB)
sqlite_cur = sqlite_conn.cursor()

mysql_conn = mysql.connector.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DATABASE
)
mysql_cur = mysql_conn.cursor()

# === GET TABLES FROM SQLITE ===
sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = sqlite_cur.fetchall()

for (table_name,) in tables:
    # Skip SQLite internal tables
    if table_name.startswith("sqlite_"):
        print(f"⏭️  Skipping internal SQLite table: {table_name}")
        continue

    print(f"\n⚙️  Migrating table: {table_name}")

    # Get CREATE TABLE SQL from SQLite
    sqlite_cur.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}'")
    create_table_sql = sqlite_cur.fetchone()[0]

    # Fix SQLite → MySQL syntax differences
    create_table_sql = (
        create_table_sql.replace("AUTOINCREMENT", "AUTO_INCREMENT")
        .replace("INTEGER PRIMARY KEY", "INT PRIMARY KEY AUTO_INCREMENT")
        .replace("TEXT", "VARCHAR(255)")
        .replace("REAL", "DOUBLE")
        .replace("BLOB", "LONGBLOB")
    )

    # Drop and recreate
    mysql_cur.execute(f"DROP TABLE IF EXISTS `{table_name}`")
    mysql_cur.execute(create_table_sql)

    # Copy data
    sqlite_cur.execute(f"SELECT * FROM `{table_name}`")
    rows = sqlite_cur.fetchall()
    if not rows:
        print("   ⚠️  No data found in this table.")
        continue

    col_names = [desc[0] for desc in sqlite_cur.description]
    placeholders = ", ".join(["%s"] * len(col_names))
    col_names_str = ", ".join(f"`{c}`" for c in col_names)

    insert_sql = f"INSERT INTO `{table_name}` ({col_names_str}) VALUES ({placeholders})"

    for row in rows:
        try:
            mysql_cur.execute(insert_sql, row)
        except Exception as e:
            print(f"   ⚠️  Skipped one row due to: {e}")

    mysql_conn.commit()
    print(f"   ✅  Table {table_name} migrated successfully ({len(rows)} rows).")

sqlite_conn.close()
mysql_conn.close()
print("\n🎉 Migration complete!")
