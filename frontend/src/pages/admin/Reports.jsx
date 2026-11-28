// import { useEffect, useState } from 'react'
// import { getAllTransactions, getDailySummary, getTopAccounts } from '../../api/client.js'
// import { Page, inr } from '../../components/ui.jsx'

// function downloadCsv(rows, name) {
//   const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
//   const a = document.createElement('a')
//   a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
//   a.download = name
//   a.click()
// }

// export default function Reports() {
//   const [txs, setTxs] = useState([])
//   const [summary, setSummary] = useState(null)
//   const [top, setTop] = useState([])
//   const today = new Date().toISOString().slice(0, 10)

//   useEffect(() => {
//     getAllTransactions().then(setTxs).catch(() => {})
//     getDailySummary(today).then(setSummary).catch(() => {})
//     getTopAccounts().then(setTop).catch(() => {})
//   }, [])

//   const failed = txs.filter((t) => t.status === 'FAILED' || t.status === 'REJECTED')
//   const causes = {}
//   failed.forEach((t) => { const r = t.message || t.status; causes[r] = (causes[r] || 0) + 1 })

//   const exportRows = txs.map((t) => [t.transactionId, t.timestamp, t.type, t.sourceAccount, t.destinationAccount, t.amount, t.status, t.message])

//   return (
//     <Page title="Reports" sub="Operational summaries from the backend.">
//       <div className="grid g2">
//         <div className="card">
//           <h3>Today's summary</h3>
//           {summary ? (
//             <>
//               <div className="lrow"><span className="k">Total transactions</span><b>{summary.totalTransactions}</b></div>
//               <div className="lrow"><span className="k">Success</span><b>{summary.successCount}</b></div>
//               <div className="lrow"><span className="k">Failed</span><b>{summary.failedCount}</b></div>
//               <div className="lrow"><span className="k">Rejected</span><b>{summary.rejectedCount}</b></div>
//               <div className="lrow"><span className="k">Total amount</span><b>{inr(summary.totalAmount)}</b></div>
//             </>
//           ) : <p className="k">No data for today.</p>}
//         </div>
//         <div className="card">
//           <h3>Top 10 accounts by volume</h3>
//           {top.length === 0 && <p className="k">No transactions yet.</p>}
//           <div className="scroll"><table>
//             <thead><tr><th>#</th><th>Account</th><th className="r">Transactions</th></tr></thead>
//             <tbody>{top.map((a, i) => (
//               <tr key={a.accountNumber}><td>{i + 1}</td><td>{a.accountNumber}</td><td className="r">{a.transactionCount}</td></tr>
//             ))}</tbody>
//           </table></div>
//         </div>
//       </div>
//       <div className="card">
//         <h3>Failure causes</h3>
//         {Object.keys(causes).length === 0 && <p className="k">No failures recorded.</p>}
//         {Object.entries(causes).map(([r, n]) => (
//           <div key={r} style={{ marginBottom: 10 }}>
//             <div className="lrow" style={{ border: 0, padding: '0 0 4px' }}><span>{r}</span><span className="k">{n}</span></div>
//             <div className="meter"><b style={{ width: (n / Math.max(failed.length, 1)) * 100 + '%' }} /></div>
//           </div>
//         ))}
//       </div>
//       <div className="card">
//         <h3>Available reports</h3>
//         <div className="scroll"><table>
//           <thead><tr><th>Report</th><th>Rows</th><th /></tr></thead>
//           <tbody>
//             <tr><td>Transaction summary</td><td>{txs.length}</td>
//               <td className="r"><button className="btn s" onClick={() => downloadCsv([['ID','Time','Type','From','To','Amount','Status','Reason'], ...exportRows], 'transactions.csv')}>Download CSV</button></td></tr>
//             <tr><td>Failed transaction analysis</td><td>{failed.length}</td>
//               <td className="r"><button className="btn s" onClick={() => downloadCsv([['ID','Time','Type','From','To','Amount','Status','Reason'], ...exportRows.filter((_, i) => failed.includes(txs[i]))], 'failed.csv')}>Download CSV</button></td></tr>
//           </tbody>
//         </table></div>
//       </div>
//     </Page>
//   )
// }






import { useEffect, useState } from 'react'
import {
  getTopAccounts, getFailedByReason, getDailyAmounts, getAccountsAbove,
  getCustomerHistory, getAccounts, getCustomers,
} from '../../api/client.js'
import { Empty, Page, Tag, ftime, inr } from '../../components/ui.jsx'

/* ---------- small helpers ---------- */
function downloadCsv(rows, name) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
}
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d) }
const shortDate = (s) => new Date(s + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const pretty = (r) => String(r || 'Unknown').replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())
const STATUS = { SUCCESS: 'Completed', FAILED: 'Failed', REJECTED: 'Rejected', REVERSED: 'Reversed' }
const TYPES = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']
const TYPE_LABEL = { DEPOSIT: 'Deposit', WITHDRAWAL: 'Withdrawal', TRANSFER: 'Transfer' }

// loads one report; returns [{ data, loading, error }, retry]
function useReport(fn, deps) {
  const [st, setSt] = useState({ data: null, loading: true, error: '' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setSt((p) => ({ ...p, loading: true, error: '' }))
    fn()
      .then((data) => live && setSt({ data: data || [], loading: false, error: '' }))
      .catch((e) => live && setSt({ data: null, loading: false, error: e.message || 'Could not load this report.' }))
    return () => { live = false }
  }, [...deps, tick])
  return [st, () => setTick((n) => n + 1)]
}

// shows loading, error (with retry), empty, or the report itself
function State({ st, retry, empty, children }) {
  if (st.loading) return <Empty text="Loading…" />
  if (st.error) return <div className="alert" role="alert">{st.error} <button className="linkbtn" onClick={retry}>Try again</button></div>
  if (!st.data || st.data.length === 0) return <Empty text={empty} />
  return children
}

function Card({ title, sub, action, children }) {
  return (
    <div className="card">
      <div className="rep-h">
        <div><div className="rep-t">{title}</div><div className="sub">{sub}</div></div>
        {action}
      </div>
      {children}
    </div>
  )
}

const Csv = ({ st, rows, name }) => (
  <button className="btn s" disabled={!st.data || !st.data.length} onClick={() => downloadCsv(rows(), name)}>Download CSV</button>
)

/* ---------- Report 1: top 10 accounts ---------- */
function TopAccounts({ names }) {
  const [st, retry] = useReport(getTopAccounts, [])
  const list = st.data || []
  const max = Math.max(...list.map((r) => Number(r.transactionCount)), 1)
  return (
    <Card title="Top 10 accounts by transaction volume" sub="Completed transactions, money in and out"
      action={<Csv st={st} name="top-accounts.csv" rows={() => [['Rank', 'Account', 'Holder', 'Transactions'], ...list.map((r, i) => [i + 1, r.accountNumber, names[r.accountNumber] || '', r.transactionCount])]} />}>
      <State st={st} retry={retry} empty="No transactions yet.">
        <div className="scroll"><table>
          <thead><tr><th>#</th><th>Account</th><th>Holder</th><th className="r">Transactions</th><th style={{ width: '24%' }} /></tr></thead>
          <tbody>{list.map((r, i) => (
            <tr key={r.accountNumber}>
              <td><span className="rank">{i + 1}</span></td>
              <td>{r.accountNumber}</td>
              <td>{names[r.accountNumber] || '—'}</td>
              <td className="r">{r.transactionCount}</td>
              <td><span className="bar" style={{ width: (Number(r.transactionCount) / max) * 100 + '%' }} /></td>
            </tr>
          ))}</tbody>
        </table></div>
      </State>
    </Card>
  )
}

/* ---------- Report 2: failed transactions by reason ---------- */
function FailedByReason() {
  const [st, retry] = useReport(getFailedByReason, [])
  const list = st.data || []
  const total = list.reduce((s, r) => s + Number(r.count), 0)
  return (
    <Card title="Failed transactions by reason" sub={total ? `${total} failed or rejected in total` : 'Grouped by failure reason'}
      action={<Csv st={st} name="failed-by-reason.csv" rows={() => [['Reason', 'Count'], ...list.map((r) => [r.reason, r.count])]} />}>
      <State st={st} retry={retry} empty="No failed transactions. Everything went through.">
        {list.map((r) => (
          <div key={r.reason} style={{ marginBottom: 14 }}>
            <div className="lrow" style={{ border: 0, padding: '0 0 6px' }}>
              <span>{pretty(r.reason)}</span>
              <span><b>{r.count}</b> <span className="sub">· {Math.round((Number(r.count) / total) * 100)}%</span></span>
            </div>
            <div className="meter bad"><b style={{ width: (Number(r.count) / total) * 100 + '%' }} /></div>
          </div>
        ))}
      </State>
    </Card>
  )
}

/* ---------- Report 3: daily amounts by type ---------- */
function DailyAmounts() {
  const [from, setFrom] = useState(daysAgo(29))
  const [to, setTo] = useState(daysAgo(0))
  const [range, setRange] = useState({ from: daysAgo(29), to: daysAgo(0) })
  const [formErr, setFormErr] = useState('')
  const [st, retry] = useReport(() => getDailyAmounts(range.from, range.to), [range.from, range.to])

  const apply = (f, t) => {
    if (!f || !t) return setFormErr('Choose both dates.')
    if (f > t) return setFormErr('The From date must be on or before the To date.')
    if ((new Date(t) - new Date(f)) / 864e5 > 366) return setFormErr('Choose a range of 366 days or less.')
    setFormErr(''); setFrom(f); setTo(t); setRange({ from: f, to: t })
  }
  const preset = (n) => apply(daysAgo(n - 1), daysAgo(0))

  const rows = st.data || []
  const by = {}
  rows.forEach((r) => { (by[r.date] = by[r.date] || {})[r.type] = Number(r.totalAmount) })
  const all = []
  for (let d = new Date(range.from + 'T12:00:00'); ymd(d) <= range.to && all.length < 400; d.setDate(d.getDate() + 1)) all.push(ymd(d))
  const days = all.length <= 45 ? all : all.filter((x) => by[x])
  const sumOf = (k) => rows.filter((r) => r.type === k).reduce((s, r) => s + Number(r.totalAmount), 0)
  const max = Math.max(...rows.map((r) => Number(r.totalAmount)), 1)

  return (
    <Card title="Daily transaction amount by type" sub="Completed deposits, withdrawals and transfers, day by day"
      action={<Csv st={st} name="daily-amounts.csv" rows={() => [['Date', 'Type', 'Total amount'], ...rows.map((r) => [r.date, r.type, r.totalAmount])]} />}>
      <form className="rep-form" onSubmit={(e) => { e.preventDefault(); apply(from, to) }}>
        <div className="f"><label htmlFor="df">From</label><input id="df" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="f"><label htmlFor="dt">To</label><input id="dt" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <button className="btn p">Apply</button>
        <button type="button" className="btn" onClick={() => preset(7)}>Last 7 days</button>
        <button type="button" className="btn" onClick={() => preset(30)}>Last 30 days</button>
      </form>
      {formErr && <div className="alert" role="alert">{formErr}</div>}

      <State st={st} retry={retry} empty="No completed transactions between these dates.">
        <div className="tiles">
          {TYPES.map((k) => (
            <div className="tile" key={k}>
              <div className="k"><i className={'sw ' + k} />{TYPE_LABEL[k]}s</div>
              <div className="tile-v">{inr(sumOf(k))}</div>
            </div>
          ))}
        </div>
        <div className="scroll">
          <div className="tflow" style={{ minWidth: days.length > 14 ? days.length * 26 : 0 }}>
            {days.map((d, i) => (
              <div className="tcol" key={d}>
                <div className="tbars">
                  {TYPES.map((k) => {
                    const v = by[d]?.[k] || 0
                    return <b key={k} className={'tb ' + k} style={{ height: v ? Math.max((v / max) * 100, 3) + '%' : '1%' }} title={`${shortDate(d)} · ${TYPE_LABEL[k]}: ${inr(v)}`} />
                  })}
                </div>
                <span>{days.length <= 14 || i % 5 === 0 ? shortDate(d) : ''}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="legend">{TYPES.map((k) => <span key={k} style={{ marginRight: 14 }}><i className={'sw ' + k} />{TYPE_LABEL[k]}</span>)}</div>
      </State>
    </Card>
  )
}

/* ---------- Report 4: accounts above N transactions ---------- */
function AccountsAbove({ names }) {
  const [input, setInput] = useState('3')
  const [th, setTh] = useState(3)
  const [formErr, setFormErr] = useState('')
  const [st, retry] = useReport(() => getAccountsAbove(th), [th])
  const list = st.data || []

  const apply = (e) => {
    e.preventDefault()
    const n = Number(input)
    if (input.trim() === '' || !Number.isInteger(n) || n < 0 || n > 1000000) return setFormErr('Enter a whole number between 0 and 1,000,000.')
    setFormErr(''); setTh(n)
  }

  return (
    <Card title="Accounts with more than N transactions" sub={`Accounts with more than ${th} completed transactions`}
      action={<Csv st={st} name="accounts-above-threshold.csv" rows={() => [['Account', 'Holder', 'Transactions'], ...list.map((r) => [r.accountNumber, names[r.accountNumber] || '', r.transactionCount])]} />}>
      <form className="rep-form" onSubmit={apply}>
        <div className="f"><label htmlFor="th">More than (transactions)</label><input id="th" inputMode="numeric" value={input} onChange={(e) => setInput(e.target.value)} /></div>
        <button className="btn p">Apply</button>
      </form>
      {formErr && <div className="alert" role="alert">{formErr}</div>}
      <State st={st} retry={retry} empty={`No account has more than ${th} transactions.`}>
        <div className="scroll"><table>
          <thead><tr><th>#</th><th>Account</th><th>Holder</th><th className="r">Transactions</th><th className="r">Above limit by</th></tr></thead>
          <tbody>{list.map((r, i) => (
            <tr key={r.accountNumber}>
              <td><span className="rank">{i + 1}</span></td>
              <td>{r.accountNumber}</td>
              <td>{names[r.accountNumber] || '—'}</td>
              <td className="r">{r.transactionCount}</td>
              <td className="r up">+{Number(r.transactionCount) - th}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </State>
    </Card>
  )
}

/* ---------- Report 5: customer transaction history ---------- */
const SIZE = 10
function CustomerHistory({ customers }) {
  const [cid, setCid] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState(null)          // the search that was submitted
  const [page, setPage] = useState(0)
  const [formErr, setFormErr] = useState('')
  const [st, retry] = useReport(
    () => (q ? getCustomerHistory(q.cid, { page, size: SIZE, from: q.from, to: q.to }) : Promise.resolve([])),
    [q, page])

  useEffect(() => { if (!cid && customers.length) setCid(String(customers[0].id)) }, [customers])

  const search = (e) => {
    e.preventDefault()
    if (!cid) return setFormErr('Choose a customer.')
    if (from && to && from > to) return setFormErr('The From date must be on or before the To date.')
    setFormErr(''); setPage(0); setQ({ cid, from, to })
  }
  const list = st.data || []

  return (
    <Card title="Customer transaction history" sub="Every transaction on all of a customer's accounts, newest first"
      action={<Csv st={st} name="customer-history.csv" rows={() => [['Reference', 'Type', 'Amount', 'Status', 'Time'], ...list.map((t) => [t.transactionId, t.type, t.amount, t.status, t.timestamp])]} />}>
      <form className="rep-form" onSubmit={search}>
        <div className="f"><label htmlFor="hc">Customer</label>
          <select id="hc" value={cid} onChange={(e) => setCid(e.target.value)}>
            {customers.length === 0 && <option value="">No customers</option>}
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} (ID {c.id})</option>)}
          </select></div>
        <div className="f"><label htmlFor="hf">From</label><input id="hf" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="f"><label htmlFor="ht">To</label><input id="ht" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <button className="btn p">Search</button>
      </form>
      {formErr && <div className="alert" role="alert">{formErr}</div>}

      {!q ? <Empty text="Choose a customer and press Search to see their transaction history." /> : (
        <>
          <State st={st} retry={retry} empty="No transactions found for this customer in the selected dates.">
            <div className="scroll"><table>
              <thead><tr><th>Reference</th><th>Type</th><th className="r">Amount</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>{list.map((t) => (
                <tr key={t.transactionId}>
                  <td>{t.transactionId}</td><td>{TYPE_LABEL[t.type] || t.type}</td>
                  <td className="r">{inr(t.amount)}</td>
                  <td><Tag s={STATUS[t.status] || t.status} /></td>
                  <td>{ftime(t.timestamp)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </State>
          {!st.error && (
            <div className="pager">
              <span className="sub">Page {page + 1}{list.length ? ` · ${list.length} shown` : ''}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn s" disabled={page === 0 || st.loading} onClick={() => setPage(page - 1)}>Previous</button>
                <button className="btn s" disabled={list.length < SIZE || st.loading} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

/* ---------- page ---------- */
export default function Reports() {
  const [names, setNames] = useState({})
  const [customers, setCustomers] = useState([])
  const [key, setKey] = useState(0)

  useEffect(() => {
    getAccounts().then((a) => setNames(Object.fromEntries((a || []).map((x) => [x.accountNumber, x.customerName])))).catch(() => {})
    getCustomers().then((c) => setCustomers(c || [])).catch(() => {})
  }, [])

  return (
    <Page title="Reports" sub="Five operational reports on transactions, failures and accounts."
      action={<button className="btn" onClick={() => setKey((k) => k + 1)}>Refresh all</button>}>
      <div className="grid g2">
        <TopAccounts key={'a' + key} names={names} />
        <FailedByReason key={'b' + key} />
      </div>
      <DailyAmounts key={'c' + key} />
      <AccountsAbove key={'d' + key} names={names} />
      <CustomerHistory key={'e' + key} customers={customers} />
    </Page>
  )
}
