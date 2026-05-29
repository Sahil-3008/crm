# SupportDesk — Customer Support Ticketing CRM

A full-stack, production-ready CRM for managing customer support tickets, built with **FastAPI** (backend) and **React + Tailwind CSS** (frontend).

---

## ✨ Features

| Feature | Details |
|---|---|
| **Create Tickets** | Customer info, issue title/description, priority selection |
| **List & Paginate** | Sortable table, 20 per page |
| **Search** | Full-text across ID, name, email, title, description |
| **Filter by Status** | Open / In Progress / Closed tabs |
| **View & Edit** | Slide-in drawer with full edit + notes |
| **Activity Logs** | Auto-logged on every create/update |
| **Dashboard Stats** | Total, Open, In Progress, Closed counts |
| **Export CSV** | Download filtered or all tickets |
| **Delete** | With confirmation guard |

---

## 🗂 Folder Structure

```
crm/
├── backend/
│   ├── main.py               # FastAPI app entry
│   ├── requirements.txt
│   ├── Procfile              # Railway deployment
│   ├── .env.example
│   ├── database/
│   │   └── db.py             # MYSQL setup
│   ├── models/
│   │   └── ticket.py         # DB CRUD operations
│   ├── routes/
│   │   ├── tickets.py        # /api/tickets endpoints
│   │   └── stats.py          # /api/stats endpoint
│   └── schemas/
│       └── ticket.py         # Pydantic validation
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Layout.jsx        # Sidebar + topbar shell
        │   ├── Badges.jsx        # Status & Priority badges
        │   └── TicketModal.jsx   # Detail/edit drawer
        ├── pages/
        │   ├── Dashboard.jsx     # Stats + recent tickets
        │   ├── Tickets.jsx       # Full ticket list
        │   └── NewTicket.jsx     # Creation form
        ├── hooks/
        │   └── useTickets.js     # Data-fetching hooks
        ├── services/
        │   └── api.js            # Axios API layer
        └── utils/
            └── format.js         # Date formatters
```

---

## 🗄 Database Schema

### `tickets`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | Auto-generated `TKT-XXXXXXXX` |
| `customer_name` | TEXT | Required |
| `customer_email` | TEXT | Required, validated |
| `issue_title` | TEXT | Required |
| `issue_description` | TEXT | Required |
| `status` | TEXT | Open / In Progress / Closed |
| `priority` | TEXT | Low / Medium / High / Urgent |
| `created_at` | TEXT | ISO 8601 UTC |
| `updated_at` | TEXT | ISO 8601 UTC |
| `notes` | TEXT | Internal agent notes |

### `activity_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `ticket_id` | TEXT FK | References `tickets.id` |
| `action` | TEXT | e.g. "created", "updated" |
| `detail` | TEXT | Human-readable change summary |
| `timestamp` | TEXT | ISO 8601 UTC |

---

## 🔌 REST API Reference

Base URL: `https://your-railway-app.railway.app`

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets` | List tickets (paginated, filterable) |
| `GET` | `/api/tickets/export` | Download CSV |
| `GET` | `/api/tickets/{id}` | Get single ticket |
| `PATCH` | `/api/tickets/{id}` | Update ticket |
| `DELETE` | `/api/tickets/{id}` | Delete ticket |
| `GET` | `/api/tickets/{id}/logs` | Activity log |
| `GET` | `/api/stats` | Dashboard statistics |

### Query Parameters for `GET /api/tickets`
| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | Filter: `Open`, `In Progress`, `Closed` |
| `search` | string | — | Full-text search |
| `sort_by` | string | `created_at` | Column to sort |
| `sort_order` | string | `desc` | `asc` or `desc` |
| `page` | int | `1` | Page number |
| `limit` | int | `20` | Items per page (max 100) |

### Example — Create Ticket
```json
POST /api/tickets
{
  "customer_name": "Alice Wong",
  "customer_email": "alice@example.com",
  "issue_title": "Login page returns 500",
  "issue_description": "After the latest deploy I cannot log in. Browser console shows a 500 error.",
  "priority": "High"
}
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd crm/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit env (optional — defaults work)
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

### 2. Frontend

```bash
cd crm/frontend

# Install dependencies
npm install

# Copy env and set backend URL
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend available at: **http://localhost:3000**

---

## ☁️ Deployment

### Backend → Railway

1. Push `backend/` to a GitHub repository.
2. Create a new project on [Railway](https://railway.app).
3. Connect the GitHub repo.
4. Railway auto-detects the `Procfile` and runs:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Add environment variable if needed:
   ```
   DATABASE_URL=./crm.db
   ```
6. Copy the generated Railway URL (e.g. `https://crm-api.railway.app`).

> **Note:** Railway's ephemeral filesystem means the SQLite file resets on redeploy. For production persistence, swap SQLite for a Railway-provisioned Postgres database.

---

### Frontend → Railway

1. Push your frontend/ folder to a GitHub repository.
2. Click Deploy from GitHub Repo and select your repository.
3. If your frontend is inside a subfolder (frontend), set: Root Directory as frontend
4. Add **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-production.up.railway.app
   ```
5. Deploy.

---

## 🔧 Development Scripts

| Command | Description |
|---|---|
| `uvicorn main:app --reload` | Backend dev server with hot-reload |
| `npm run dev` | Frontend dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | MySQL |
| Validation | Pydantic v2 |
| Frontend | React 18, Vite, React Router v6 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Fonts | Syne (display), DM Sans (body), JetBrains Mono |

---

## 📄 License
