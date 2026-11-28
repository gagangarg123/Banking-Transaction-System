// // import { useEffect, useState } from 'react'
// // import { Link } from 'react-router-dom'
// // import { useAuth } from '../../context/AuthContext.jsx'
// // import { getAccounts, getAccountTransactions } from '../../api/client.js'
// // import { Bars, Kpi, Page, TxTable, inr } from '../../components/ui.jsx'

// // const mapTx = (t, accNo) => ({
// //   id: t.transactionId,
// //   date: t.timestamp,
// //   fromId: t.sourceAccount === accNo ? 'me' : t.sourceAccount,
// //   toId: t.destinationAccount === accNo ? 'me' : t.destinationAccount,
// //   fromAcc: t.sourceAccount || '',
// //   toAcc: t.destinationAccount || '',
// //   fromName: t.sourceAccount || '—',
// //   toName: t.destinationAccount || '—',
// //   amount: Number(t.amount),
// //   status: t.status === 'SUCCESS' ? 'Completed' : 'Failed',
// //   reason: t.message || '',
// //   remarks: '',
// //   thread: '',
// // })

// // export default function Dashboard() {
// //   const { user } = useAuth()
// //   const [acc, setAcc] = useState(null)
// //   const [txs, setTxs] = useState([])

// //   useEffect(() => {
// //     if (!user?.customerId) return
// //     getAccounts()
// //       .then((list) => list.find((a) => a.customerId === user.customerId))
// //       .then(async (a) => {
// //         setAcc(a)
// //         if (a) {
// //           const raw = await getAccountTransactions(a.accountNumber)
// //           setTxs((raw || []).map((t) => mapTx(t, a.accountNumber)))
// //         }
// //       })
// //       .catch(() => {})
// //   }, [user])

// //   const done = txs.filter((t) => t.status === 'Completed')
// //   const month = (t) => new Date(t.date).getMonth() === new Date().getMonth()
// //   const sum = (a) => a.reduce((s, t) => s + t.amount, 0)
// //   const moneyIn = sum(done.filter((t) => t.toAcc === acc?.accountNumber && month(t)))
// //   const moneyOut = sum(done.filter((t) => t.fromAcc === acc?.accountNumber && month(t)))

// //   return (
// //     <Page title="Dashboard" sub={`Welcome back, ${user.name.split(' ')[0]}.`} action={<Link className="btn p" to="/customer/transfer">New transfer</Link>}>
// //       <div className="grid g4">
// //         <Kpi hero k="Available balance" v={inr(acc?.balance ?? 0)} s={`Savings ••${(acc?.accountNumber || '').slice(-4)}`} />
// //         <Kpi k="Money in this month" v={inr(moneyIn)} s={<span className="up">Credits received</span>} />
// //         <Kpi k="Money out this month" v={inr(moneyOut)} s="Transfers sent" />
// //         <Kpi k="Failed transfers" v={txs.filter((t) => t.status === 'Failed').length} s="Recent" />
// //       </div>
// //       <div className="card">
// //         <h3>Recent transactions <Link className="lnk" to="/customer/transactions">View all</Link></h3>
// //         <TxTable rows={txs.slice(0, 5)} me={acc?.accountNumber} />
// //       </div>
// //     </Page>
// //   )
// // }
// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext.jsx'
// import { getAccounts, getAccount, getAccountTransactions, doDeposit, doWithdraw } from '../../api/client.js'
// import { findMyAccount, mapTransaction } from '../../api/mappers.js'
// import { Bars, Kpi, Page, TxTable, inr } from '../../components/ui.jsx'

// const newTxnId = () => 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

// export default function Dashboard() {
//   const { user } = useAuth()
//   const [acc, setAcc] = useState(null)
//   const [txs, setTxs] = useState([])
//   const [form, setForm] = useState(null)        // 'deposit' | 'withdraw' | null
//   const [amount, setAmount] = useState('')
//   const [msg, setMsg] = useState('')
//   const [busy, setBusy] = useState(false)

//   const load = async (a) => {
//     if (!a) return
//     const raw = await getAccountTransactions(a.accountNumber)
//     setTxs((raw || []).map((t) => mapTransaction(t, a.accountNumber)))
//     const fresh = await getAccount(a.accountNumber)
//     setAcc(fresh)
//   }

//   useEffect(() => {
//     if (!user?.customerId) return
//     findMyAccount(getAccounts, user.customerId).then(load).catch(() => {})
//   }, [user])

//   const submit = async (e) => {
//     e.preventDefault()
//     const amt = Number(amount)
//     if (!(amt > 0)) return setMsg('Enter an amount greater than zero.')
//     setBusy(true); setMsg('')
//     try {
//       const body = {
//         transactionId: newTxnId(),
//         type: form === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL',
//         amount: amt,
//         ...(form === 'deposit'
//           ? { destinationAccount: acc.accountNumber }
//           : { sourceAccount: acc.accountNumber }),
//       }
//       const res = form === 'deposit' ? await doDeposit(body) : await doWithdraw(body)
//       if (res.status !== 'SUCCESS') throw new Error(res.message || 'Transaction failed')
//       setMsg(`${form === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${inr(amt)} successful.`)
//       setForm(null); setAmount('')
//       await load(acc)
//     } catch (x) { setMsg(x.message) }
//     setBusy(false)
//   }

//   const done = txs.filter((t) => t.status === 'Completed')
//   const month = (t) => new Date(t.date).getMonth() === new Date().getMonth()
//   const sum = (a) => a.reduce((s, t) => s + t.amount, 0)
//   const moneyIn = sum(done.filter((t) => t.toAcc === acc?.accountNumber && month(t)))
//   const moneyOut = sum(done.filter((t) => t.fromAcc === acc?.accountNumber && month(t)))

//   return (
//     <Page title="Dashboard" sub={`Welcome back, ${user.name.split(' ')[0]}.`} action={
//       // <div className="hover-actions">
//       //   <button className="btn" onClick={() => { setForm('deposit'); setMsg(''); setAmount('') }}>Deposit</button>
//       //   <button className="btn" onClick={() => { setForm('withdraw'); setMsg(''); setAmount('') }}>Withdraw</button>
//       //   <Link className="btn p" to="/customer/transfer">New transfer</Link>
//       // </div>}>

//             <div className="actions">
//         <button className="btn dep" onClick={() => { setForm('deposit'); setMsg(''); setAmount('') }}>Deposit</button>
//         <button className="btn wd" onClick={() => { setForm('withdraw'); setMsg(''); setAmount('') }}>Withdraw</button>
//         <Link className="btn p" to="/customer/transfer">New transfer</Link>
//       </div>}>

//       {form && (
//         <form className="card" style={{ maxWidth: 480 }} onSubmit={submit}>
//           <h3>{form === 'deposit' ? 'Deposit money' : 'Withdraw money'}</h3>
//           {msg && <div className="alert" role="alert">{msg}</div>}
//           <div className="f">
//             <label htmlFor="amt">Amount (₹)</label>
//             <input id="amt" inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
//           </div>
//           <div className="lrow"><span className="k">Account</span><span>{acc?.accountNumber} – {inr(acc?.balance ?? 0)}</span></div>
//           <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
//             <button className="btn p" disabled={busy}>{busy ? 'Processing…' : 'Confirm ' + form}</button>
//             <button type="button" className="btn" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
//           </div>
//         </form>
//       )}
//       {!form && msg && <div className="alert info" role="status">{msg}</div>}

//       <div className="grid g4">
//         <Kpi hero k="Available balance" v={inr(acc?.balance ?? 0)} s={`Savings ••${(acc?.accountNumber || '').slice(-4)}`} />
//         <Kpi k="Money in this month" v={inr(moneyIn)} s={<span className="up">Credits received</span>} />
//         <Kpi k="Money out this month" v={inr(moneyOut)} s="Transfers sent" />
//         <Kpi k="Failed transfers" v={txs.filter((t) => t.status === 'Failed').length} s="Recent" />
//       </div>
//       <div className="card">
//         <h3>Recent transactions <Link className="lnk" to="/customer/transactions">View all</Link></h3>
//         <TxTable rows={txs.slice(0, 5)} me={acc?.accountNumber} />
//       </div>
//     </Page>
//   )
// }





import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAccounts, getAccount, getAccountTransactions, doDeposit, doWithdraw } from '../../api/client.js'
import { findMyAccount, mapTransaction } from '../../api/mappers.js'
import { ActivityList, FlowBars, Page, Tag, inr } from '../../components/ui.jsx'

const newTxnId = () => 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
const sum = (a) => a.reduce((s, t) => s + t.amount, 0)

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [acc, setAcc] = useState(null)
  const [txs, setTxs] = useState([])
  const [names, setNames] = useState({})
  const [form, setForm] = useState(null)        // 'deposit' | 'withdraw' | null
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState('')
  const [loadErr, setLoadErr] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async (a) => {
    if (!a) return
    const raw = await getAccountTransactions(a.accountNumber)
    setTxs((raw || []).map((t) => mapTransaction(t, a.accountNumber)))
    setAcc(await getAccount(a.accountNumber))
  }

  useEffect(() => {
    if (!user?.customerId) return
    findMyAccount(getAccounts, user.customerId).then(load)
      .catch(() => setLoadErr('Could not load your account. Check that the server is running and try again.'))
  }, [user])

  const no = acc?.accountNumber

  // people you recently sent money to
  const recipients = []
  txs.forEach((t) => { if (t.type === 'TRANSFER' && t.fromAcc === no && t.toAcc && !recipients.includes(t.toAcc)) recipients.push(t.toAcc) })
  const top = recipients.slice(0, 4)
  useEffect(() => {
    top.forEach((a) => getAccount(a).then((x) => setNames((n) => ({ ...n, [a]: x.customerName }))).catch(() => {}))
  }, [txs])

  const openForm = (kind) => { setForm(kind); setMsg(''); setAmount('') }

  const submit = async (e) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!(amt > 0)) return setMsg('Enter an amount greater than zero.')
    setBusy(true); setMsg('')
    try {
      const body = {
        transactionId: newTxnId(),
        type: form === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL',
        amount: amt,
        ...(form === 'deposit' ? { destinationAccount: no } : { sourceAccount: no }),
      }
      const res = form === 'deposit' ? await doDeposit(body) : await doWithdraw(body)
      if (res.status !== 'SUCCESS') throw new Error(res.message || 'Transaction failed')
      setMsg(`${form === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${inr(amt)} successful.`)
      setForm(null); setAmount('')
      await load(acc)
    } catch (x) { setMsg(x.message) }
    setBusy(false)
  }

  const copy = () => {
    navigator.clipboard?.writeText(no || '')
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const done = txs.filter((t) => t.status === 'Completed')
  const month = (t) => { const d = new Date(t.date), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }
  const isIn = (t) => t.toAcc === no && t.fromAcc !== no
  const isOut = (t) => t.fromAcc === no
  const moneyIn = sum(done.filter((t) => isIn(t) && month(t)))
  const moneyOut = sum(done.filter((t) => isOut(t) && month(t)))
  const failedCount = txs.filter((t) => t.status !== 'Completed').length

  const week = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i)
    const day = done.filter((t) => new Date(t.date).toDateString() === d.toDateString())
    return [d.toLocaleDateString('en-IN', { weekday: 'short' }), sum(day.filter(isIn)), sum(day.filter(isOut))]
  })

  const today = new Date().toDateString()
  const usedToday = sum(done.filter((t) => t.type === 'TRANSFER' && isOut(t) && new Date(t.date).toDateString() === today))
  const limit = Number(acc?.dailyTransferLimit ?? 200000)
  const status = acc?.status === 'ACTIVE' ? 'Active' : acc?.status === 'FROZEN' ? 'Frozen' : ''
  const today_s = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Page title="Dashboard" sub={`${greeting()}, ${user.name.split(' ')[0]}. ${today_s}.`} action={
      <div className="actions">
        <button className="btn dep" onClick={() => openForm('deposit')}>Deposit</button>
        <button className="btn wd" onClick={() => openForm('withdraw')}>Withdraw</button>
        <Link className="btn p" to="/customer/transfer">New transfer</Link>
      </div>}>

      {loadErr && <div className="alert" role="alert">{loadErr}</div>}

      {form && (
        <form className="card" style={{ maxWidth: 480 }} onSubmit={submit}>
          <h3>{form === 'deposit' ? 'Deposit money' : 'Withdraw money'}</h3>
          {msg && <div className="alert" role="alert">{msg}</div>}
          <div className="f">
            <label htmlFor="amt">Amount (₹)</label>
            <input id="amt" inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="lrow"><span className="k">Account</span><span>{no} – {inr(acc?.balance ?? 0)}</span></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn p" disabled={busy}>{busy ? 'Processing…' : 'Confirm ' + form}</button>
            <button type="button" className="btn" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
          </div>
        </form>
      )}
      {!form && msg && <div className="alert info" role="status">{msg}</div>}

      <div className="grid g211">
        <div className="card hero">
          <div className="k">Available balance</div>
          <div className="big bigger">{inr(acc?.balance ?? 0)}</div>
          <div className="sub">Savings ••{(no || '').slice(-4)} {status && '· ' + status}</div>
          <div className="hero-foot">
            <span className="sub">{no || '—'}</span>
            <button className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
        <div className="card">
          <div className="k">Money in this month</div>
          <div className="big">{inr(moneyIn)}</div>
          <div className="sub up">Credits received</div>
        </div>
        <div className="card">
          <div className="k">Money out this month</div>
          <div className="big">{inr(moneyOut)}</div>
          <div className="sub">Transfers and withdrawals</div>
        </div>
      </div>

      <div className="grid g21">
        <div className="card">
          <h3>Money in and out, last 7 days</h3>
          <FlowBars data={week} />
        </div>
        <div className="card">
          <h3>Account <Tag s={status || 'Active'} /></h3>
          <div className="lrow"><span className="k">Type</span><span>{acc?.accountType || 'Savings'}</span></div>
          <div className="lrow"><span className="k">Failed or rejected</span><span className={failedCount ? 'dn' : ''}>{failedCount}</span></div>
          <div style={{ marginTop: 12 }}>
            <div className="lrow" style={{ border: 0, padding: '0 0 6px' }}><span className="k">Daily transfer limit</span><span>{inr(usedToday)} / {inr(limit)}</span></div>
            <div className="meter"><b style={{ width: Math.min((usedToday / limit) * 100, 100) + '%' }} /></div>
          </div>
        </div>
      </div>

      <div className="grid g21">
        <div className="card">
          <h3>Recent activity <Link className="lnk" to="/customer/transactions">View all</Link></h3>
          <ActivityList rows={txs.slice(0, 6)} me={no} />
        </div>
        <div className="card">
          <h3>Send money</h3>
          {top.length === 0
            ? <p className="k">People you send money to will appear here.</p>
            : (
              <div className="people">
                {top.map((a) => (
                  <button key={a} className="person" onClick={() => nav('/customer/transfer?to=' + a)}>
                    <span className="pav">{(names[a] || a).slice(0, 1).toUpperCase()}</span>
                    <span>{names[a] ? names[a].split(' ')[0] : '••' + a.slice(-4)}</span>
                  </button>
                ))}
              </div>
            )}
          <Link className="btn p wide" style={{ textAlign: 'center', marginTop: 14 }} to="/customer/transfer">Send to a new account</Link>
        </div>
      </div>
    </Page>
  )
}
