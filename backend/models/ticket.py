"""
models/ticket.py
All database interactions for tickets and activity logs — MySQL version.
"""

from __future__ import annotations
import uuid
import math
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from database.db import get_connection


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

def _gen_id() -> str:
    return "TKT-" + str(uuid.uuid4()).upper()[:8]


def create_ticket(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        ticket_id = _gen_id()
        now = _now()
        cursor.execute(
            """
            INSERT INTO tickets
                (id, customer_name, customer_email, issue_title,
                 issue_description, status, priority, created_at, updated_at, notes)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                ticket_id,
                data["customer_name"],
                data["customer_email"],
                data["issue_title"],
                data["issue_description"],
                "Open",
                data.get("priority", "Medium"),
                now, now, "",
            ),
        )
        _log_activity(cursor, ticket_id, "created", "Ticket created")
        conn.commit()
        return get_ticket_by_id(ticket_id)
    finally:
        cursor.close()
        conn.close()


def get_all_tickets(
    status=None, search=None,
    sort_by="created_at", sort_order="desc",
    page=1, limit=20,
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        where_clauses, params = [], []

        if status:
            where_clauses.append("status = %s")
            params.append(status)

        if search:
            term = f"%{search}%"
            where_clauses.append(
                "(id LIKE %s OR customer_name LIKE %s OR customer_email LIKE %s "
                "OR issue_title LIKE %s OR issue_description LIKE %s)"
            )
            params.extend([term, term, term, term, term])

        where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        allowed_sorts = {"created_at", "updated_at", "customer_name", "status", "priority"}
        col = sort_by if sort_by in allowed_sorts else "created_at"
        order = "ASC" if sort_order.lower() == "asc" else "DESC"

        cursor.execute(f"SELECT COUNT(*) as cnt FROM tickets {where_sql}", params)
        total = cursor.fetchone()["cnt"]

        offset = (page - 1) * limit
        cursor.execute(
            f"SELECT * FROM tickets {where_sql} ORDER BY {col} {order} LIMIT %s OFFSET %s",
            params + [limit, offset],
        )
        rows = cursor.fetchall()

        return {
            "tickets": rows,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": math.ceil(total / limit) if total else 1,
        }
    finally:
        cursor.close()
        conn.close()


def get_ticket_by_id(ticket_id: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,))
        return cursor.fetchone() or None
    finally:
        cursor.close()
        conn.close()


def update_ticket(ticket_id: str, updates: Dict[str, Any]):
    if not updates:
        return get_ticket_by_id(ticket_id)
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        updates["updated_at"] = _now()
        set_clause = ", ".join(f"{k} = %s" for k in updates)
        values = list(updates.values()) + [ticket_id]
        cursor.execute(f"UPDATE tickets SET {set_clause} WHERE id = %s", values)
        changes = ", ".join(k for k in updates if k != "updated_at")
        _log_activity(cursor, ticket_id, "updated", f"Fields updated: {changes}")
        conn.commit()
        return get_ticket_by_id(ticket_id)
    finally:
        cursor.close()
        conn.close()


def delete_ticket(ticket_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tickets WHERE id = %s", (ticket_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
        conn.close()


def export_tickets_csv(status=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if status:
            cursor.execute(
                "SELECT * FROM tickets WHERE status = %s ORDER BY created_at DESC", (status,)
            )
        else:
            cursor.execute("SELECT * FROM tickets ORDER BY created_at DESC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def _log_activity(cursor, ticket_id: str, action: str, detail: str = "") -> None:
    try:
        cursor.execute(
            "INSERT INTO activity_logs (ticket_id, action, detail, timestamp) VALUES (%s,%s,%s,%s)",
            (ticket_id, action, detail, _now()),
        )
    except Exception:
        pass


def get_activity_logs(ticket_id: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM activity_logs WHERE ticket_id = %s ORDER BY timestamp DESC",
            (ticket_id,),
        )
        return cursor.fetchall()
    except Exception:
        return []
    finally:
        cursor.close()
        conn.close()


def get_stats():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status='Open'        THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status='Closed'      THEN 1 ELSE 0 END) as closed,
                SUM(CASE WHEN priority IN ('High','Urgent') THEN 1 ELSE 0 END) as high_urgent
            FROM tickets
        """)
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()