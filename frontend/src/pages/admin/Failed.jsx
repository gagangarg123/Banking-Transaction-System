import { useEffect, useState } from 'react'
import { getAllTransactions } from '../../api/client.js'
import { Kpi, Page, Tag, ftime, inr } from '../../components/ui.jsx'

export default function Failed() {
  const [failed, setFailed] = useState([])

  useEffect(() => {
    getAllTransactions()
      .then((txs) => setFailed((txs || []).filter((t) => t.status === 'FAILED' || t.status === 'REJECTED')))
      .catch(() => {})
  }, [])

  const count = (s) => failed.filter((t) => (t.message || '').toLowerCase().includes(s)).length

  return (
    <Page title="Failed transactions" sub="Transactions that did not complete, with the cause.">
      <div className="grid g4">
        <Kpi k="Failed" v={failed.length} s="Total" />
        <Kpi k="Insufficient balance" v={count('insufficient')} s="Needs customer action" />
        <Kpi k="Account issues" v={count('not found') + count('frozen') + count('inactive')} s="Account state" />
        <Kpi k="Rejected" v={failed.filter((t) => t.status === 'REJECTED').length} s="Invalid requests" />
      </div>
      <div className="card">
        {failed.length === 0 ? <p className="k">No failed transactions.</p> : (
          <div className="scroll"><table>
            <thead><tr><th>Reference</th><th>Type</th><th>Accounts</th><th>Reason</th><th>Time</th><th className="r">Amount</th><th>Status</th></tr></thead>
            <tbody>{failed.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.transactionId}</td><td>{t.type}</td>
                <td>{t.sourceAccount || '—'} → {t.destinationAccount || '—'}</td>
                <td>{t.message || '—'}</td><td>{ftime(t.timestamp)}</td>
                <td className="r">{inr(t.amount)}</td>
                <td><Tag s={t.status === 'REJECTED' ? 'Rejected' : 'Failed'} /></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </Page>
  )
}
