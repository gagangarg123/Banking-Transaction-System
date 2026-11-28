import { useEffect, useState } from 'react'
import { getAllTransactions, getDailySummary, getTopAccounts } from '../../api/client.js'
import { Page, inr } from '../../components/ui.jsx'

function downloadCsv(rows, name) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
}

export default function Reports() {
  const [txs, setTxs] = useState([])
  const [summary, setSummary] = useState(null)
  const [top, setTop] = useState([])
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    getAllTransactions().then(setTxs).catch(() => {})
    getDailySummary(today).then(setSummary).catch(() => {})
    getTopAccounts().then(setTop).catch(() => {})
  }, [])

  const failed = txs.filter((t) => t.status === 'FAILED' || t.status === 'REJECTED')
  const causes = {}
  failed.forEach((t) => { const r = t.message || t.status; causes[r] = (causes[r] || 0) + 1 })

  const exportRows = txs.map((t) => [t.transactionId, t.timestamp, t.type, t.sourceAccount, t.destinationAccount, t.amount, t.status, t.message])

  return (
    <Page title="Reports" sub="Operational summaries from the backend.">
      <div className="grid g2">
        <div className="card">
          <h3>Today's summary</h3>
          {summary ? (
            <>
              <div className="lrow"><span className="k">Total transactions</span><b>{summary.totalTransactions}</b></div>
              <div className="lrow"><span className="k">Success</span><b>{summary.successCount}</b></div>
              <div className="lrow"><span className="k">Failed</span><b>{summary.failedCount}</b></div>
              <div className="lrow"><span className="k">Rejected</span><b>{summary.rejectedCount}</b></div>
              <div className="lrow"><span className="k">Total amount</span><b>{inr(summary.totalAmount)}</b></div>
            </>
          ) : <p className="k">No data for today.</p>}
        </div>
        <div className="card">
          <h3>Top 10 accounts by volume</h3>
          {top.length === 0 && <p className="k">No transactions yet.</p>}
          <div className="scroll"><table>
            <thead><tr><th>#</th><th>Account</th><th className="r">Transactions</th></tr></thead>
            <tbody>{top.map((a, i) => (
              <tr key={a.accountNumber}><td>{i + 1}</td><td>{a.accountNumber}</td><td className="r">{a.transactionCount}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
      <div className="card">
        <h3>Failure causes</h3>
        {Object.keys(causes).length === 0 && <p className="k">No failures recorded.</p>}
        {Object.entries(causes).map(([r, n]) => (
          <div key={r} style={{ marginBottom: 10 }}>
            <div className="lrow" style={{ border: 0, padding: '0 0 4px' }}><span>{r}</span><span className="k">{n}</span></div>
            <div className="meter"><b style={{ width: (n / Math.max(failed.length, 1)) * 100 + '%' }} /></div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Available reports</h3>
        <div className="scroll"><table>
          <thead><tr><th>Report</th><th>Rows</th><th /></tr></thead>
          <tbody>
            <tr><td>Transaction summary</td><td>{txs.length}</td>
              <td className="r"><button className="btn s" onClick={() => downloadCsv([['ID','Time','Type','From','To','Amount','Status','Reason'], ...exportRows], 'transactions.csv')}>Download CSV</button></td></tr>
            <tr><td>Failed transaction analysis</td><td>{failed.length}</td>
              <td className="r"><button className="btn s" onClick={() => downloadCsv([['ID','Time','Type','From','To','Amount','Status','Reason'], ...exportRows.filter((_, i) => failed.includes(txs[i]))], 'failed.csv')}>Download CSV</button></td></tr>
          </tbody>
        </table></div>
      </div>
    </Page>
  )
}
