from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    issue_title: str
    issue_description: str
    priority: str


class TicketUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    issue_title: Optional[str] = None
    issue_description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class TicketOut(BaseModel):
    id: str
    customer_name: str
    customer_email: EmailStr
    issue_title: str
    issue_description: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    notes: Optional[str] = ""


class ActivityLog(BaseModel):
    id: int
    ticket_id: str
    action: str
    detail: str
    timestamp: datetime


class PaginatedTickets(BaseModel):
    tickets: List[TicketOut]
    total: int
    page: int
    limit: int
    pages: int

from pydantic import BaseModel


class StatsOut(BaseModel):
    total: int
    open: int
    closed: int
    in_progress: int