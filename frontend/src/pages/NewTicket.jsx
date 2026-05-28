import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { ticketService } from '../services/api'

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export default function NewTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: '', customer_email: '',
    issue_title: '', issue_description: '',
    priority: 'Medium',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim())     e.customer_name     = 'Required'
    if (!form.customer_email.trim())    e.customer_email    = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email))
                                         e.customer_email    = 'Invalid email'
    if (!form.issue_title.trim())       e.issue_title       = 'Required'
    if (!form.issue_description.trim()) e.issue_description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const ticket = await ticketService.create(form)
      toast.success(`Ticket ${ticket.id} created!`)
      navigate('/tickets')
    } catch (e) {
      const detail = e.response?.data?.detail
      if (Array.isArray(detail)) toast.error(detail.map(d => d.msg).join(', '))
      else toast.error(detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn-icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1>New Ticket</h1>
            <p>Submit a new customer support request</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: 28 }}>

        {/* Customer Info */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="form-section-num">1</span>
            Customer Information
          </div>
          <div className="form-grid">
            <Field label="Customer Name" error={errors.customer_name}>
              <input
                className={`input${errors.customer_name ? ' error' : ''}`}
                placeholder="Jane Smith"
                value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)}
              />
            </Field>
            <Field label="Customer Email" error={errors.customer_email}>
              <input
                className={`input${errors.customer_email ? ' error' : ''}`}
                type="email"
                placeholder="jane@example.com"
                value={form.customer_email}
                onChange={e => set('customer_email', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <hr className="form-divider" />

        {/* Issue Details */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="form-section-num">2</span>
            Issue Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Issue Title" error={errors.issue_title}>
              <input
                className={`input${errors.issue_title ? ' error' : ''}`}
                placeholder="Brief summary of the problem…"
                value={form.issue_title}
                onChange={e => set('issue_title', e.target.value)}
              />
            </Field>
            <Field label="Issue Description" error={errors.issue_description}>
              <textarea
                className={`input resize-none${errors.issue_description ? ' error' : ''}`}
                style={{ height: 120 }}
                placeholder="Describe the issue in detail — include steps to reproduce, error messages, etc."
                value={form.issue_description}
                onChange={e => set('issue_description', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <hr className="form-divider" />

        {/* Priority */}
        <div className="form-section" style={{ marginBottom: 0 }}>
          <div className="form-section-title">
            <span className="form-section-num">3</span>
            Priority Level
          </div>
          <div className="priority-grid">
            {PRIORITIES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => set('priority', p)}
                className={`priority-btn${form.priority === p ? ` active-${p.toLowerCase()}` : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
          Ticket ID and timestamp will be auto-generated
        </p>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            : <Send size={14} />}
          {loading ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}
