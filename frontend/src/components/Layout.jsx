import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Ticket, Plus, Menu, X, Bell, ChevronRight, ChevronDown } from 'lucide-react'
import '../App.css'

const nav = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets',     icon: Ticket,          label: 'All Tickets' },
  { to: '/tickets/new', icon: Plus,            label: 'New Ticket', accent: true },
]

const PAGE_NAMES = {
  '/':            'Dashboard',
  '/tickets':     'All Tickets',
  '/tickets/new': 'New Ticket',
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const pageName = PAGE_NAMES[location.pathname] || 'Dashboard'

  return (
    <div className="app">

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="overlay"
          style={{ zIndex: 45 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">D</div>
          <div className="sidebar-logo-text">
            <strong>Datastraw CRM</strong>
            <span>Support Ticketing Dashboard</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', display: 'flex' }}
            className="lg-hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav>
          <p className="nav-section-label">Menu</p>
          {nav.map(({ to, icon: Icon, label, accent }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? (accent ? 'active-accent' : 'active') : ''
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          Datastraw Assessment Assignment · Built with End-to-End focus
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 8, color: 'var(--gray-500)' }}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="topbar-breadcrumb">
              <span>Datastraw CRM</span>
              <ChevronRight size={13} />
              <span className="current">{pageName}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-notif">
              <Bell size={18} />
              <span className="notif-dot" />
            </div>
            <div className="topbar-avatar">
              <div className="avatar-circle">A</div>
              <span>Admin</span>
              <ChevronDown size={14} style={{ color: 'var(--gray-400)' }} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
