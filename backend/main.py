"""
Customer Support Ticketing CRM - FastAPI Backend
Entry point: configures CORS, mounts routers, initializes DB
uvicorn main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.db import init_db
from routes import tickets, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield

app = FastAPI(
    title="Support Ticket CRM API",
    description="REST API for managing customer support tickets",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(stats.router,   prefix="/api/stats",   tags=["Stats"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Support Ticket CRM API is running"}