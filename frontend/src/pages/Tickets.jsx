import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Ticket } from 'lucide-react'
import { useTickets } from '../hooks/useTickets'
import { ticketService } from '../services/api'
import { StatusBadge, PriorityBadge } from '../components/Badges'
import TicketModal from '../components/TicketModal'
import { formatDateShort } from '../utils/format'
import toast from 'react-hot-toast'

const STATUSES = ['', 'Open', 'In Progress', 'Closed']
const STATUS_LABELS = { '': 'All', 'Open': 'Open', 'In Progress': 'In Progress', 'Closed': 'Closed' }

const COLUMNS = [
  { key: 'id',            label: 'Ticket ID',    sortable: false },
  { key: 'customer_name', label: 'Customer',      sortable: true  },
  { key: 'issue_title',   label: 'Subject',       sortable: false },
  { key: 'status',        label: 'Status',        sortable: true  },
  { key: 'priority',      label: 'Priority',      sortable: true  },
  { key: 'created_at',    label: 'Created Date',  sortable: true  },
]

export default function Tickets() {
  const navigate  = useNavigate()
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [sortBy,    setSortBy]    = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState(null)
  const [exporting, setExporting] = useState(false)

  const { tickets, total, pages, loading, error, reload } = useTickets({
    search: search || undefined, status: status || undefined,
    sort_by: sortBy, sort_order: sortOrder, page, limit: 20,
  })

  const applySearch = useCallback((val) => {
    setSearch(val); setPage(1)
    reload({ search: val || undefined, status: status || undefined, page: 1 })
  }, [status, reload])

  const applyStatus = (s) => {
    setStatus(s); setPage(1)
    reload({ status: s || undefined, search: search || undefined, page: 1 })
  }

  const applySort = (col) => {
    const newOrder = sortBy === col && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(col); setSortOrder(newOrder)
    reload({ sort_by: col, sort_order: newOrder })
  }

  const goPage = (p) => { setPage(p); reload({ page: p }) }

  const handleExport = async () => {
    setExporting(true)
    try { await ticketService.exportCSV(status || undefined); toast.success('CSV downloaded') }
    catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={11} style={{ opacity: .3 }} />
    return sortOrder === 'asc'
      ? <ChevronUp   size={11} style={{ color: 'var(--blue)' }} />
      : <ChevronDown size={11} style={{ color: 'var(--blue)' }} />
  }

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>All Tickets</h1>
          <p>{total} ticket{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-ghost" onClick={handleExport} disabled={exporting}>
            <Download size={14} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/tickets/new')}>
            <Plus size={15} /> Create Ticket
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="input"
            placeholder="Search by name, ID, email, or subject..."
            value={search}
            onChange={e => applySearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>FILTER:</span>
          <div className="filter-tabs">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => applyStatus(s)}
                className={`filter-tab${status === s ? ' active' : ''}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : error ? (
          <div className="empty-state"><p style={{ color: 'var(--red)' }}>{error}</p></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <Ticket size={32} />
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && applySort(col.key)}
                      style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {col.label}
                        {col.sortable && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} onClick={() => setSelected(t.id)}>
                    <td><span className="td-ticket-id">{t.id}</span></td>
                    <td>
                      <div className="td-customer-name">{t.customer_name}</div>
                      <div className="td-customer-email">{t.customer_email}</div>
                    </td>
                    <td>
                      <div className="td-issue-title">{t.issue_title}</div>
                      {t.issue_description && (
                        <div className="td-issue-preview truncate" style={{ maxWidth: 240 }}>
                          {t.issue_description.slice(0, 55)}{t.issue_description.length > 55 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><span className="td-date">{formatDateShort(t.created_at)}</span></td>
                    <td onClick={e => { e.stopPropagation(); setSelected(t.id); }}>
                      <button className="action-view-btn">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <span>Page {page} of {pages}</span>
            <div className="pagination-pages">
              <button className="page-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`page-btn${p === page ? ' active' : ''}`}
                >{p}</button>
              ))}
              <button className="page-btn" disabled={page >= pages} onClick={() => goPage(page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <TicketModal
          ticketId={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { reload({}); setSelected(null) }}
        />
      )}
    </div>
  )
}
