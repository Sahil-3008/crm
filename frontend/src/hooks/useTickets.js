/**
 * hooks/useTickets.js
 * Custom React hooks for fetching tickets and stats.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ticketService, statsService } from '../services/api'

// ── useTickets ────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filterable list of tickets.
 *
 * @param {object} initialParams  - Initial query params (status, search, sort_by, etc.)
 * @returns {{ tickets, total, pages, loading, error, reload, refetch }}
 */
export function useTickets(initialParams = {}) {
  const [params,  setParams]  = useState(initialParams)
  const [data,    setData]    = useState({ tickets: [], total: 0, page: 1, limit: 20, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Keep a ref so reload closures always see the latest params
  const paramsRef = useRef(params)
  paramsRef.current = params

  const fetch = useCallback(async (overrides = {}) => {
    setLoading(true)
    setError(null)
    try {
      const merged = { ...paramsRef.current, ...overrides }
      // Strip undefined values so they don't appear in the query string
      const clean = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== undefined && v !== '')
      )
      const result = await ticketService.list(clean)
      setData(result)
      setParams(merged)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tickets: data.tickets,
    total:   data.total,
    page:    data.page,
    pages:   data.pages,
    loading,
    error,
    /** Re-fetch with optional param overrides (merges with current params) */
    reload:  fetch,
    /** Alias for reload without params — handy after mutations */
    refetch: () => fetch(),
  }
}

// ── useTicket (single) ────────────────────────────────────────────────────────

/**
 * Fetch a single ticket + its activity logs.
 *
 * @param {string} ticketId
 * @returns {{ ticket, logs, loading, error, refetch }}
 */
export function useTicket(ticketId) {
  const [ticket,  setTicket]  = useState(null)
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      const [t, l] = await Promise.all([
        ticketService.get(ticketId),
        ticketService.getLogs(ticketId),
      ])
      setTicket(t)
      setLogs(l)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => { fetch() }, [fetch])

  return { ticket, logs, loading, error, refetch: fetch }
}

// ── useStats ──────────────────────────────────────────────────────────────────

/**
 * Fetch dashboard statistics.
 *
 * @returns {{ stats, loading, error }}
 */
export function useStats() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    statsService.get()
      .then(setStats)
      .catch(e => setError(e.response?.data?.detail || 'Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading, error }
}