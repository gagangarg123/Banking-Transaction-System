import { Link } from 'react-router-dom'
import { customers, last7, useDb } from '../../api/store.js'
import { Bars, Kpi, Page, Tag, ftime, inr } from '../../components/ui.jsx'

export default function Dashboard() {
  const db = useDb()
  const done = db.txs.filter((t) => t.status === 'Completed')
  const failed = db.txs.filter((t) => t.status === 'Failed')
  const rate = db.txs.length ? ((done.length / db.txs.length) * 100).toFixed(1) : '100'
  return (
    <Page title="Dashboard" sub="System health and transaction volume.">
      <div className="grid g4">
        <Kpi hero k="Transactions" v={db.txs.length} s={`${done.length} completed`} />
        <Kpi k="Success rate" v={rate + '%'} s={`${failed.length} failed`} />
        <Kpi k="Value processed" v={inr(done.reduce((s, t) => s + t.amount, 0))} s="All time" />
        <Kpi k="Customers" v={customers().length} s={`${customers().filter((c) => c.status === 'Frozen').length} frozen`} />
      </div>
      <div className="grid g2">
        <div className="card"><h3>Value processed, last 7 days</h3><Bars data={last7(db.txs, () => true)} /></div>
        <div className="card">
          <h3>Worker thread pool <Tag s="Active" /></h3>
          {/* TODO: replace with live metrics from your Java backend */}
          {[['Active threads', '14 / 20'], ['Queue depth', '37'], ['Row locks held', '22'], ['Deadlocks (24 h)', '3']].map(([k, v]) => <div className="lrow" key={k}><span className="k">{k}</span><b>{v}</b></div>)}
        </div>
      </div>
      <div className="card">
        <h3>Latest failures <Link className="lnk" to="/admin/failed">View all</Link></h3>
        <div className="scroll"><table>
          <thead><tr><th>Reference</th><th>Reason</th><th>Thread</th><th>Time</th><th className="r">Amount</th></tr></thead>
          <tbody>{failed.slice(0, 4).map((t) => <tr key={t.id}><td>{t.id}</td><td>{t.reason}</td><td>{t.thread}</td><td>{ftime(t.date)}</td><td className="r">{inr(t.amount)}</td></tr>)}</tbody>
        </table></div>
      </div>
    </Page>
  )
}
