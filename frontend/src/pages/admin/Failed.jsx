import { useState } from 'react'
import { retryTx, useDb } from '../../api/store.js'
import { Kpi, Page, Tag, ftime, inr } from '../../components/ui.jsx'

export default function Failed() {
  const db = useDb()
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const failed = db.txs.filter((t) => t.status === 'Failed')
  const count = (s) => failed.filter((t) => t.reason.toLowerCase().includes(s)).length

  const retry = async (id) => {
    setBusy(id); setMsg('')
    try { await retryTx(id); setMsg(`${id} completed on retry.`) }
    catch (e) { setMsg(`${id} failed again: ${e.message}`) }
    setBusy('')
  }

  return (
    <Page title="Failed transactions" sub="Transactions that did not complete, with the cause and worker thread.">
      <div className="grid g4">
        <Kpi k="Failed" v={failed.length} s="Total" />
        <Kpi k="Deadlocks" v={count('deadlock')} s="Safe to retry" />
        <Kpi k="Lock timeouts" v={count('lock')} s="Safe to retry" />
        <Kpi k="Insufficient balance" v={count('insufficient')} s="Needs customer action" />
      </div>
      {msg && <div className="alert info" role="status">{msg}</div>}
      <div className="card">
        {failed.length === 0 ? <p className="k">No failed transactions.</p> : (
          <div className="scroll"><table>
            <thead><tr><th>Reference</th><th>From</th><th>To</th><th>Reason</th><th>Thread</th><th>Time</th><th className="r">Amount</th><th>Status</th><th /></tr></thead>
            <tbody>{failed.map((t) => (
              <tr key={t.id}><td>{t.id}</td><td>{t.fromName}</td><td>{t.toName}</td><td>{t.reason}</td><td>{t.thread}</td><td>{ftime(t.date)}</td><td className="r">{inr(t.amount)}</td>
                <td><Tag s={busy === t.id ? 'Retrying' : 'Failed'} /></td>
                <td className="r"><button className="btn s" disabled={!!busy} onClick={() => retry(t.id)}>Retry</button></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </Page>
  )
}
