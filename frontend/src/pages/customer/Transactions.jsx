import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { txsFor, useDb } from '../../api/store.js'
import { Page, TxTable } from '../../components/ui.jsx'

export default function Transactions() {
  const { user } = useAuth()
  useDb()
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')

  const rows = txsFor(user.id).filter((t) => {
    const out = t.fromId === user.id
    const text = `${t.id} ${t.fromName} ${t.toName} ${t.remarks}`.toLowerCase()
    return text.includes(q.toLowerCase()) && (type === 'All' || (type === 'Sent') === out) && (status === 'All' || t.status === status)
  })

  return (
    <Page title="Transactions" sub="Everything you sent and received.">
      <div className="card">
        <div className="filters">
          <input placeholder="Search by reference or name" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}><option>All</option><option>Sent</option><option>Received</option></select>
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Completed</option><option>Failed</option></select>
        </div>
        <TxTable rows={rows} me={user.id} />
      </div>
    </Page>
  )
}
