import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAccounts, getAccountTransactions } from '../../api/client.js'
import { findMyAccount, mapTransaction } from '../../api/mappers.js'
import { Page, TxTable } from '../../components/ui.jsx'

export default function Transactions() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [accNo, setAccNo] = useState('')
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    if (!user?.customerId) return
    findMyAccount(getAccounts, user.customerId).then(async (a) => {
      if (!a) return
      setAccNo(a.accountNumber)
      const raw = await getAccountTransactions(a.accountNumber)
      setRows((raw || []).map((t) => mapTransaction(t, a.accountNumber)))
    }).catch(() => {})
  }, [user])

  const filtered = rows.filter((t) => {
    const out = t.fromAcc === accNo
    const text = `${t.id} ${t.fromName} ${t.toName} ${t.remarks}`.toLowerCase()
    return text.includes(q.toLowerCase()) && (type === 'All' || (type === 'Sent') === out) && (status === 'All' || t.status === status)
  })

  return (
    <Page title="Transactions" sub="Everything you sent and received.">
      <div className="card">
        <div className="filters">
          <input placeholder="Search by reference or name" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}><option>All</option><option>Sent</option><option>Received</option></select>
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Completed</option><option>Failed</option><option>Rejected</option></select>
        </div>
        <TxTable rows={filtered} me={accNo} />
      </div>
    </Page>
  )
}
