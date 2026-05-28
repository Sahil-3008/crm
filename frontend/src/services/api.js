/**
 * services/api.js
 * Axios-based API client for the Support Ticket CRM backend.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Ticket service ────────────────────────────────────────────────────────────

export const ticketService = {
  /** Create a new ticket */
  create(data) {
    return api.post('/api/tickets/', data).then(r => r.data)
  },

  /** List tickets with optional filters */
  list(params = {}) {
    return api.get('/api/tickets/', { params }).then(r => r.data)
  },

  /** Get a single ticket by ID */
  get(id) {
    return api.get(`/api/tickets/${id}`).then(r => r.data)
  },

  /** Get activity logs for a ticket */
  getLogs(id) {
    return api.get(`/api/tickets/${id}/logs`).then(r => r.data)
  },

  /** Partially update a ticket */
  update(id, data) {
    return api.patch(`/api/tickets/${id}`, data).then(r => r.data)
  },

  /** Delete a ticket */
  remove(id) {
    return api.delete(`/api/tickets/${id}`)
  },

  /** Download tickets as CSV — triggers browser file download */
  async exportCSV(status) {
    const params = status ? { status } : {}
    const response = await api.get('/api/tickets/export', {
      params,
      responseType: 'blob',
    })
    const url  = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', 'tickets.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

// ── Stats service ─────────────────────────────────────────────────────────────

export const statsService = {
  get() {
    return api.get('/api/stats/').then(r => r.data)
  },
}