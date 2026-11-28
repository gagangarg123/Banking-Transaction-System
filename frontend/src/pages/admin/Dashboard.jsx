// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { getCustomers, getAccounts, getAllTransactions } from '../../api/client.js'
// import { Kpi, Page, Tag, ftime, inr } from '../../components/ui.jsx'

// export default function Dashboard() {
//   const [customers, setCustomers] = useState([])
//   const [accounts, setAccounts] = useState([])
//   const [txs, setTxs] = useState([])

//   useEffect(() => {
//     getCustomers().then(setCustomers).catch(() => {})
//     getAccounts().then(setAccounts).catch(() => {})
//     getAllTransactions().then(setTxs).catch(() => {})
//   }, [])

//   const done = txs.filter((t) => t.status === 'SUCCESS')
//   const failed = txs.filter((t) => t.status === 'FAILED' || t.status === 'REJECTED')
//   const rate = txs.length ? ((done.length / txs.length) * 100).toFixed(1) : '100'
//   const frozen = accounts.filter((a) => a.status === 'FROZEN').length

//   return (
//     <Page title="Dashboard" sub="System health and transaction volume.">
//       <div className="grid g4">
//         <Kpi hero k="Transactions" v={txs.length} s={`${done.length} completed`} />
//         <Kpi k="Success rate" v={rate + '%'} s={`${failed.length} failed/rejected`} />
//         <Kpi k="Value processed" v={inr(done.reduce((s, t) => s + Number(t.amount || 0), 0))} s="All time" />
//         <Kpi k="Customers" v={customers.length} s={`${frozen} accounts frozen`} />
//       </div>
//       <div className="card">
//         <h3>Latest failures <Link className="lnk" to="/admin/failed">View all</Link></h3>
//         {failed.length === 0 ? <p className="k">No failed transactions.</p> : (
//           <div className="scroll"><table>
//             <thead><tr><th>Reference</th><th>Type</th><th>Reason</th><th>Time</th><th className="r">Amount</th></tr></thead>
//             <tbody>{failed.slice(0, 6).map((t) => (
//               <tr key={t.transactionId}>
//                 <td>{t.transactionId}</td><td>{t.type}</td>
//                 <td>{t.message || t.status}</td><td>{ftime(t.timestamp)}</td>
//                 <td className="r">{inr(t.amount)}</td>
//               </tr>))}
//             </tbody>
//           </table></div>
//         )}
//       </div>
//     </Page>
//   )
// }




import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomers, getAccounts, getAllTransactions } from '../../api/client.js'
import { FlowBars, Page, TxFeed, ftime, inr } from '../../components/ui.jsx'

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
const isOk = (t) => t.status === 'SUCCESS'
const isBad = (t) => t.status === 'FAILED' || t.status === 'REJECTED'

export default function Dashboard() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [txs, setTxs] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([getCustomers(), getAccounts(), getAllTransactions()])
      .then(([c, a, t]) => { setCustomers(c || []); setAccounts(a || []); setTxs(t || []) })
      .catch(() => setErr('Could not load data. Check that the server is running and try again.'))
  }, [])

  const sorted = [...txs].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
  const done = txs.filter(isOk)
  const failed = sorted.filter(isBad)
  const rate = txs.length ? (done.length / txs.length) * 100 : 100
  const value = done.reduce((s, t) => s + Number(t.amount || 0), 0)
  const frozen = accounts.filter((a) => a.status === 'FROZEN').length
  const deposits = accounts.reduce((s, a) => s + Number(a.balance || 0), 0)
  const names = Object.fromEntries(accounts.map((a) => [a.accountNumber, a.customerName]))

  const todayTx = txs.filter((t) => new Date(t.timestamp).toDateString() === new Date().toDateString())
  const week = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i)
    const day = txs.filter((t) => new Date(t.timestamp).toDateString() === d.toDateString())
    return [d.toLocaleDateString('en-IN', { weekday: 'short' }), day.filter(isOk).length, day.filter(isBad).length]
  })
  const mix = [['Transfers', 'TRANSFER'], ['Deposits', 'DEPOSIT'], ['Withdrawals', 'WITHDRAWAL']]
    .map(([label, k]) => [label, txs.filter((t) => t.type === k).length])
  const today_s = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Page title="Dashboard" sub={`${greeting()}, ${user.name.split(' ')[0]}. ${today_s}.`} action={
      <div className="actions">
        <Link className="btn" to="/admin/reports">Reports</Link>
        <Link className="btn p" to="/admin/customers">Manage customers</Link>
      </div>}>

      {err && <div className="alert" role="alert">{err}</div>}

      <div className="grid g4">
        <div className="card hero">
          <div className="k">Transactions today</div>
          <div className="big bigger">{todayTx.length}</div>
          <div className="sub">{todayTx.filter(isOk).length} completed · {todayTx.filter(isBad).length} failed</div>
        </div>
        <div className="card">
          <div className="k">Value processed</div>
          <div className="big">{inr(value)}</div>
          <div className="sub">{done.length} successful transactions</div>
        </div>
        <div className="card">
          <div className="k">Success rate</div>
          <div className="big">{rate.toFixed(1)}%</div>
          <div className="meter" style={{ margin: '6px 0 4px' }}><b style={{ width: rate + '%' }} /></div>
          <div className="sub">{failed.length} failed or rejected</div>
        </div>
        <div className="card">
          <div className="k">Customers</div>
          <div className="big">{customers.length}</div>
          <div className="sub">{accounts.length} accounts · {frozen} frozen</div>
        </div>
      </div>

      <div className="grid g21">
        <div className="card">
          <h3>Transactions, last 7 days</h3>
          <FlowBars data={week} labels={['Completed', 'Failed']} fmt={(n) => n + ' transactions'} bad />
        </div>
        <div className="card">
          <h3>Transaction mix</h3>
          {mix.map(([label, n]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div className="lrow" style={{ border: 0, padding: '0 0 6px' }}><span>{label}</span><b>{n}</b></div>
              <div className="meter"><b style={{ width: (n / Math.max(txs.length, 1)) * 100 + '%' }} /></div>
            </div>
          ))}
          <p className="sub" style={{ margin: 0 }}>{txs.length} transactions in total</p>
        </div>
      </div>

      <div className="grid g21">
        <div className="card">
          <h3>Recent transactions <Link className="lnk" to="/admin/reports">Reports</Link></h3>
          <TxFeed rows={sorted.slice(0, 7)} names={names} />
        </div>
        <div className="card">
          <h3>Needs attention <Link className="lnk" to="/admin/failed">View failures</Link></h3>
          <div className="lrow"><span className="k">Failed or rejected</span><b className={failed.length ? 'dn' : ''}>{failed.length}</b></div>
          <div className="lrow"><span className="k">Frozen accounts</span><b>{frozen}</b></div>
          <div className="lrow"><span className="k">Total deposits</span><b>{inr(deposits)}</b></div>
          {failed.slice(0, 3).map((t) => (
            <div className="lrow" key={t.transactionId}>
              <div><div>{t.message || t.status}</div><div className="sub">{ftime(t.timestamp)}</div></div>
              <span className="dn">{inr(t.amount)}</span>
            </div>
          ))}
          {failed.length === 0 && <p className="k" style={{ margin: '10px 0 0' }}>No failed transactions.</p>}
        </div>
      </div>
    </Page>
  )
}
