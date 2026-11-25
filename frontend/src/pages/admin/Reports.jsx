import { last7, useDb } from '../../api/store.js'
import { Bars, Page } from '../../components/ui.jsx'

function downloadCsv(txs) {
  const head = ['Reference', 'Date', 'From', 'To', 'Amount', 'Status', 'Reason', 'Thread']
  const rows = txs.map((t) => [t.id, t.date, t.fromName, t.toName, t.amount, t.status, t.reason, t.thread])
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'transaction-summary.csv'
  a.click()
}

export default function Reports() {
  const db = useDb()
  const failed = db.txs.filter((t) => t.status === 'Failed')
  const causes = {}
  failed.forEach((t) => { causes[t.reason] = (causes[t.reason] || 0) + 1 })
  return (
    <Page title="Reports" sub="Operational summaries you can download.">
      <div className="grid g2">
        <div className="card"><h3>Daily transaction value</h3><Bars data={last7(db.txs, () => true)} /></div>
        <div className="card">
          <h3>Failure causes</h3>
          {Object.keys(causes).length === 0 && <p className="k">No failures recorded.</p>}
          {Object.entries(causes).map(([r, n]) => (
            <div key={r} style={{ marginBottom: 10 }}>
              <div className="lrow" style={{ border: 0, padding: '0 0 4px' }}><span>{r}</span><span className="k">{n}</span></div>
              <div className="meter"><b style={{ width: (n / failed.length) * 100 + '%' }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Available reports</h3>
        <div className="scroll"><table>
          <thead><tr><th>Report</th><th>Period</th><th /></tr></thead>
          <tbody>
            <tr><td>Transaction summary</td><td>All time</td><td className="r"><button className="btn s" onClick={() => downloadCsv(db.txs)}>Download CSV</button></td></tr>
            <tr><td>Failed transaction analysis</td><td>All time</td><td className="r"><button className="btn s" onClick={() => downloadCsv(failed)}>Download CSV</button></td></tr>
          </tbody>
        </table></div>
      </div>
    </Page>
  )
}
