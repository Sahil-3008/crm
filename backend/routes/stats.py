"""
routes/stats.py
Dashboard statistics endpoint.
"""

from fastapi import APIRouter
from schemas.ticket import StatsOut
from models.ticket import get_stats

router = APIRouter()


@router.get("/", response_model=StatsOut)
def dashboard_stats():
    """Return aggregate ticket counts for the dashboard."""
    return get_stats()
