"""
routes/tickets.py
All ticket-related REST endpoints.
"""

import csv
import io
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from schemas.ticket import TicketCreate, TicketUpdate, TicketOut, PaginatedTickets, ActivityLog
from models.ticket import (
    create_ticket,
    get_all_tickets,
    get_ticket_by_id,
    update_ticket,
    delete_ticket,
    export_tickets_csv,
    get_activity_logs,
)

router = APIRouter()


# ── POST /api/tickets ─────────────────────────────────────────────────────────
@router.post("/", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create(body: TicketCreate):
    """Create a new support ticket."""
    ticket = create_ticket(body.model_dump())
    return ticket


# ── GET /api/tickets ──────────────────────────────────────────────────────────
@router.get("/", response_model=PaginatedTickets)
def list_tickets(
    status:     Optional[str] = Query(None, description="Filter by status"),
    search:     Optional[str] = Query(None, description="Full-text search"),
    sort_by:    str           = Query("created_at"),
    sort_order: str           = Query("desc"),
    page:       int           = Query(1, ge=1),
    limit:      int           = Query(20, ge=1, le=100),
):
    """Return paginated, filterable, searchable ticket list."""
    return get_all_tickets(
        status=status,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )


# ── GET /api/tickets/export ───────────────────────────────────────────────────
@router.get("/export")
def export_csv(status: Optional[str] = Query(None)):
    """Download all tickets as a CSV file."""
    rows = export_tickets_csv(status)
    if not rows:
        raise HTTPException(status_code=404, detail="No tickets found")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tickets.csv"},
    )


# ── GET /api/tickets/{id} ─────────────────────────────────────────────────────
@router.get("/{ticket_id}", response_model=TicketOut)
def get_one(ticket_id: str):
    """Fetch a single ticket by ID."""
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


# ── PATCH /api/tickets/{id} ───────────────────────────────────────────────────
@router.patch("/{ticket_id}", response_model=TicketOut)
def update(ticket_id: str, body: TicketUpdate):
    """Partially update a ticket (status, notes, fields, etc.)."""
    if not get_ticket_by_id(ticket_id):
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    # Convert enum values to strings
    for key in ("status", "priority"):
        if key in updates and hasattr(updates[key], "value"):
            updates[key] = updates[key].value

    return update_ticket(ticket_id, updates)


# ── DELETE /api/tickets/{id} ──────────────────────────────────────────────────
@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(ticket_id: str):
    """Permanently delete a ticket."""
    if not delete_ticket(ticket_id):
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")


# ── GET /api/tickets/{id}/logs ────────────────────────────────────────────────
@router.get("/{ticket_id}/logs", response_model=list[ActivityLog])
def activity(ticket_id: str):
    """Fetch activity log for a ticket."""
    if not get_ticket_by_id(ticket_id):
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return get_activity_logs(ticket_id)
