import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, AlertTriangle, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react'
import { useTickets } from '../hooks/useTickets'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import TicketModal from '../components/TicketModal'
import { formatDateShort } from '../utils/format'

function StatCard({ label, value, icon: Icon, color, bg, sublabel }) {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <p className="label">{label}</p>
        <p className="value" style={{ color }}>{value ?? '—'}</p>
        {sublabel && <p className="sublabel">{sublabel}</p>}
      </div>
      <div className="stat-card-icon" style={{ background: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { tickets, loading, refetch } = useTickets({ limit: 8, sort_by: 'created_at', sort_order: 'desc' })
  const stats = {
    total:       tickets?.length || 0,
    open:        tickets?.filter(t => t.status === 'Open').length || 0,
    in_progress: tickets?.filter(t => t.status === 'In Progress').length || 0,
    closed:      tickets?.filter(t => t.status === 'Closed').length || 0,
  }
  const [selectedId, setSelectedId] = useState(null)
  const navigate = useNavigate()

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of all support tickets</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/tickets/new')}>
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Total Tickets"  value={stats.total}       icon={Ticket}        color="#2563EB" bg="#EFF6FF" sublabel="all time" />
        <StatCard label="Open"           value={stats.open}        icon={Clock}         color="#DC2626" bg="#FEE2E2" sublabel="awaiting response" />
        <StatCard label="In Progress"    value={stats.in_progress} icon={AlertTriangle} color="#D97706" bg="#FEF3C7" sublabel="being handled" />
        <StatCard label="Closed"         value={stats.closed}      icon={CheckCircle}   color="#16A34A" bg="#DCFCE7" sublabel="resolved" />
      </div>

      {/* Recent Tickets */}
      <div className="table-card">
        <div className="card-header">
          <h2>Recent Tickets</h2>
          <span className="view-all" onClick={() => navigate('/tickets')}>
            View all <ArrowRight size={13} />
          </span>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <Ticket size={32} />
            <p>No tickets yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {['Ticket ID', 'Customer', 'Subject', 'Status', 'Priority', 'Created Date'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} onClick={() => setSelectedId(t.id)}>
                    <td><span className="td-ticket-id">{t.id}</span></td>
                    <td>
                      <div className="td-customer-name">{t.customer_name}</div>
                      <div className="td-customer-email">{t.customer_email}</div>
                    </td>
                    <td>
                      <div className="td-issue-title">{t.issue_title}</div>
                      {t.issue_description && (
                        <div className="td-issue-preview truncate" style={{ maxWidth: 220 }}>
                          {t.issue_description.slice(0, 50)}{t.issue_description.length > 50 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td>
                      <div className="td-date">{formatDateShort(t.created_at)}</div>
                    </td>
                    <td onClick={e => { e.stopPropagation(); setSelectedId(t.id); }}>
                      <button className="action-view-btn">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId && (
        <TicketModal
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={() => { refetch(); setSelectedId(null) }}
        />
      )}
    </div>
  )
}
