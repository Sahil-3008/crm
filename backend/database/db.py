import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Ok1ok2ok3#",
        database="crm_db"
    )

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        issue_title VARCHAR(255),
        issue_description TEXT,
        status VARCHAR(50),
        priority VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME,
        notes TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id VARCHAR(50),
        action VARCHAR(100),
        detail TEXT,
        timestamp DATETIME
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized")