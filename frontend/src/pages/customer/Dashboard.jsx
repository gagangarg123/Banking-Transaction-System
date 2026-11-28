// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext.jsx'
// import { getAccounts, getAccountTransactions } from '../../api/client.js'
// import { Bars, Kpi, Page, TxTable, inr } from '../../components/ui.jsx'

// const mapTx = (t, accNo) => ({
//   id: t.transactionId,
//   date: t.timestamp,
//   fromId: t.sourceAccount === accNo ? 'me' : t.sourceAccount,
//   toId: t.destinationAccount === accNo ? 'me' : t.destinationAccount,
//   fromAcc: t.sourceAccount || '',
//   toAcc: t.destinationAccount || '',
//   fromName: t.sourceAccount || '—',
//   toName: t.destinationAccount || '—',
//   amount: Number(t.amount),
//   status: t.status === 'SUCCESS' ? 'Completed' : 'Failed',
//   reason: t.message || '',
//   remarks: '',
//   thread: '',
// })

// export default function Dashboard() {
//   const { user } = useAuth()
//   const [acc, setAcc] = useState(null)
//   const [txs, setTxs] = useState([])

//   useEffect(() => {
//     if (!user?.customerId) return
//     getAccounts()
//       .then((list) => list.find((a) => a.customerId === user.customerId))
//       .then(async (a) => {
//         setAcc(a)
//         if (a) {
//           const raw = await getAccountTransactions(a.accountNumber)
//           setTxs((raw || []).map((t) => mapTx(t, a.accountNumber)))
//         }
//       })
//       .catch(() => {})
//   }, [user])

//   const done = txs.filter((t) => t.status === 'Completed')
//   const month = (t) => new Date(t.date).getMonth() === new Date().getMonth()
//   const sum = (a) => a.reduce((s, t) => s + t.amount, 0)
//   const moneyIn = sum(done.filter((t) => t.toAcc === acc?.accountNumber && month(t)))
//   const moneyOut = sum(done.filter((t) => t.fromAcc === acc?.accountNumber && month(t)))

//   return (
//     <Page title="Dashboard" sub={`Welcome back, ${user.name.split(' ')[0]}.`} action={<Link className="btn p" to="/customer/transfer">New transfer</Link>}>
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
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAccounts, getAccount, getAccountTransactions, doDeposit, doWithdraw } from '../../api/client.js'
import { findMyAccount, mapTransaction } from '../../api/mappers.js'
import { Bars, Kpi, Page, TxTable, inr } from '../../components/ui.jsx'

const newTxnId = () => 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

export default function Dashboard() {
  const { user } = useAuth()
  const [acc, setAcc] = useState(null)
  const [txs, setTxs] = useState([])
  const [form, setForm] = useState(null)        // 'deposit' | 'withdraw' | null
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async (a) => {
    if (!a) return
    const raw = await getAccountTransactions(a.accountNumber)
    setTxs((raw || []).map((t) => mapTransaction(t, a.accountNumber)))
    const fresh = await getAccount(a.accountNumber)
    setAcc(fresh)
  }

  useEffect(() => {
    if (!user?.customerId) return
    findMyAccount(getAccounts, user.customerId).then(load).catch(() => {})
  }, [user])

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
        ...(form === 'deposit'
          ? { destinationAccount: acc.accountNumber }
          : { sourceAccount: acc.accountNumber }),
      }
      const res = form === 'deposit' ? await doDeposit(body) : await doWithdraw(body)
      if (res.status !== 'SUCCESS') throw new Error(res.message || 'Transaction failed')
      setMsg(`${form === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${inr(amt)} successful.`)
      setForm(null); setAmount('')
      await load(acc)
    } catch (x) { setMsg(x.message) }
    setBusy(false)
  }

  const done = txs.filter((t) => t.status === 'Completed')
  const month = (t) => new Date(t.date).getMonth() === new Date().getMonth()
  const sum = (a) => a.reduce((s, t) => s + t.amount, 0)
  const moneyIn = sum(done.filter((t) => t.toAcc === acc?.accountNumber && month(t)))
  const moneyOut = sum(done.filter((t) => t.fromAcc === acc?.accountNumber && month(t)))

  return (
    <Page title="Dashboard" sub={`Welcome back, ${user.name.split(' ')[0]}.`} action={
      // <div className="hover-actions">
      //   <button className="btn" onClick={() => { setForm('deposit'); setMsg(''); setAmount('') }}>Deposit</button>
      //   <button className="btn" onClick={() => { setForm('withdraw'); setMsg(''); setAmount('') }}>Withdraw</button>
      //   <Link className="btn p" to="/customer/transfer">New transfer</Link>
      // </div>}>

            <div className="actions">
        <button className="btn dep" onClick={() => { setForm('deposit'); setMsg(''); setAmount('') }}>Deposit</button>
        <button className="btn wd" onClick={() => { setForm('withdraw'); setMsg(''); setAmount('') }}>Withdraw</button>
        <Link className="btn p" to="/customer/transfer">New transfer</Link>
      </div>}>

      {form && (
        <form className="card" style={{ maxWidth: 480 }} onSubmit={submit}>
          <h3>{form === 'deposit' ? 'Deposit money' : 'Withdraw money'}</h3>
          {msg && <div className="alert" role="alert">{msg}</div>}
          <div className="f">
            <label htmlFor="amt">Amount (₹)</label>
            <input id="amt" inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="lrow"><span className="k">Account</span><span>{acc?.accountNumber} – {inr(acc?.balance ?? 0)}</span></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn p" disabled={busy}>{busy ? 'Processing…' : 'Confirm ' + form}</button>
            <button type="button" className="btn" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
          </div>
        </form>
      )}
      {!form && msg && <div className="alert info" role="status">{msg}</div>}

      <div className="grid g4">
        <Kpi hero k="Available balance" v={inr(acc?.balance ?? 0)} s={`Savings ••${(acc?.accountNumber || '').slice(-4)}`} />
        <Kpi k="Money in this month" v={inr(moneyIn)} s={<span className="up">Credits received</span>} />
        <Kpi k="Money out this month" v={inr(moneyOut)} s="Transfers sent" />
        <Kpi k="Failed transfers" v={txs.filter((t) => t.status === 'Failed').length} s="Recent" />
      </div>
      <div className="card">
        <h3>Recent transactions <Link className="lnk" to="/customer/transactions">View all</Link></h3>
        <TxTable rows={txs.slice(0, 5)} me={acc?.accountNumber} />
      </div>
    </Page>
  )
}