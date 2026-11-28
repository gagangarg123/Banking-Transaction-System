import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers, getAccounts, getAllTransactions } from '../../api/client.js'
import { Kpi, Page, Tag, ftime, inr } from '../../components/ui.jsx'

export default function Dashboard() {
  const [customers, setCustomers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [txs, setTxs] = useState([])

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => {})
    getAccounts().then(setAccounts).catch(() => {})
    getAllTransactions().then(setTxs).catch(() => {})
  }, [])

  const done = txs.filter((t) => t.status === 'SUCCESS')
  const failed = txs.filter((t) => t.status === 'FAILED' || t.status === 'REJECTED')
  const rate = txs.length ? ((done.length / txs.length) * 100).toFixed(1) : '100'
  const frozen = accounts.filter((a) => a.status === 'FROZEN').length

  return (
    <Page title="Dashboard" sub="System health and transaction volume.">
      <div className="grid g4">
        <Kpi hero k="Transactions" v={txs.length} s={`${done.length} completed`} />
        <Kpi k="Success rate" v={rate + '%'} s={`${failed.length} failed/rejected`} />
        <Kpi k="Value processed" v={inr(done.reduce((s, t) => s + Number(t.amount || 0), 0))} s="All time" />
        <Kpi k="Customers" v={customers.length} s={`${frozen} accounts frozen`} />
      </div>
      <div className="card">
        <h3>Latest failures <Link className="lnk" to="/admin/failed">View all</Link></h3>
        {failed.length === 0 ? <p className="k">No failed transactions.</p> : (
          <div className="scroll"><table>
            <thead><tr><th>Reference</th><th>Type</th><th>Reason</th><th>Time</th><th className="r">Amount</th></tr></thead>
            <tbody>{failed.slice(0, 6).map((t) => (
              <tr key={t.transactionId}>
                <td>{t.transactionId}</td><td>{t.type}</td>
                <td>{t.message || t.status}</td><td>{ftime(t.timestamp)}</td>
                <td className="r">{inr(t.amount)}</td>
              </tr>))}
            </tbody>
          </table></div>
        )}
      </div>
    </Page>
  )
}


