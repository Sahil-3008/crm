import { useState, useEffect } from 'react'
import { X, Save, Trash2, Clock, User, Mail, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import * as ticketService from '../services/api'
import { useTicket } from '../hooks/useTickets'
import { StatusBadge, PriorityBadge } from './Badges'
import { formatDate } from '../utils/format'

const STATUSES   = ['Open', 'In Progress', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export default function TicketModal({ ticketId, onClose, onUpdated }) {
  const { ticket, logs, loading, error, refetch } = useTicket(ticketId)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (ticket) setForm({
      customer_name: ticket.customer_name, customer_email: ticket.customer_email,
      issue_title: ticket.issue_title, issue_description: ticket.issue_description,
      status: ticket.status, priority: ticket.priority, notes: ticket.notes,
    })
  }, [ticket])

  const handleSave = async () => {
    setSaving(true)
    try {
      await ticketService.ticketService.update(ticketId, form)
      toast.success('Ticket updated')
      setEditing(false); refetch(); onUpdated?.()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Update failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return
    try {
      await ticketService.ticketService.remove(ticketId)
      toast.success('Ticket deleted'); onClose(); onUpdated?.()
    } catch { toast.error('Delete failed') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer">

        {/* Header */}
        <div className="drawer-header">
          <div>
            {ticket && (
              <>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginBottom: 4 }}>
                  {ticket.id}
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.3 }}>
                  {ticket.issue_title}
                </h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--gray-400)', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        {loading && <div className="spinner-wrap"><div className="spinner" /></div>}
        {error && <div className="empty-state"><p style={{ color: 'var(--red)' }}>{error}</p></div>}

        {ticket && !loading && (
          <div className="drawer-body">

            {/* Timestamps */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-400)' }}>
              <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <Clock size={11} /> Created {formatDate(ticket.created_at)}
              </span>
              <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <Clock size={11} /> Updated {formatDate(ticket.updated_at)}
              </span>
            </div>

            {/* Customer */}
            <div className="detail-section">
              <h3>Customer</h3>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <User size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                    <input className="input" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Mail size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                    <input className="input" type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="detail-row"><User size={14} />{ticket.customer_name}</div>
                  <div className="detail-row"><Mail size={14} style={{ color: 'var(--gray-400)' }} />
                    <span style={{ color: 'var(--gray-400)' }}>{ticket.customer_email}</span>
                  </div>
                </>
              )}
            </div>

            {/* Issue */}
            <div className="detail-section">
              <h3>Issue</h3>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input className="input" value={form.issue_title} onChange={e => set('issue_title', e.target.value)} />
                  <textarea className="input resize-none" style={{ height: 96 }} value={form.issue_description} onChange={e => set('issue_description', e.target.value)} />
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)', marginBottom: 6 }}>{ticket.issue_title}</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65 }}>{ticket.issue_description}</p>
                </>
              )}
            </div>

            {/* Status & Priority */}
            <div className="detail-section">
              <h3>Status & Priority</h3>
              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--gray-400)', display: 'block', marginBottom: 4 }}>Status</label>
                    <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--gray-400)', display: 'block', marginBottom: 4 }}>Priority</label>
                    <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="detail-section">
              <h3 style={{ display: 'flex', gap: 6, alignItems: 'center' }}><FileText size={12} />Notes</h3>
              {editing ? (
                <textarea
                  className="input resize-none"
                  style={{ height: 100 }}
                  placeholder="Add internal notes..."
                  value={form.notes || ''}
                  onChange={e => set('notes', e.target.value)}
                />
              ) : (
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65, minHeight: 40, fontStyle: ticket.notes ? 'normal' : 'italic' }}>
                  {ticket.notes || 'No notes yet'}
                </p>
              )}
            </div>

            {/* Activity */}
            {logs.length > 0 && (
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                  Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--gray-800)', textTransform: 'capitalize' }}>{log.action}</span>
                        {log.detail && <span style={{ color: 'var(--gray-400)', marginLeft: 4 }}>— {log.detail}</span>}
                        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', marginTop: 2 }}>{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {ticket && !loading && (
          <div className="drawer-footer">
            {editing ? (
              <>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: 'white' }} /> : <Save size={14} />}
                  Save Changes
                </button>
                <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => setEditing(true)}>
                  Edit Ticket
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
