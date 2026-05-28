export function StatusBadge({ status }) {
  const cls = {
    'Open':        'badge badge-open',
    'In Progress': 'badge badge-progress',
    'Closed':      'badge badge-closed',
  }
  return <span className={cls[status] || 'badge'}>{status}</span>
}

export function PriorityBadge({ priority }) {
  const cls = {
    'Low':    'badge badge-low',
    'Medium': 'badge badge-medium',
    'High':   'badge badge-high',
    'Urgent': 'badge badge-urgent',
  }
  return <span className={cls[priority] || 'badge'}>{priority}</span>
}
