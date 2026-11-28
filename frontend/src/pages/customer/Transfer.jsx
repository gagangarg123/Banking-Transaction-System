// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext.jsx'
// import { getAccounts, getAccount, getAccountTransactions, doTransfer } from '../../api/client.js'
// import { findMyAccount } from '../../api/mappers.js'
// import { Page, inr } from '../../components/ui.jsx'

// const newTxnId = () => 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

// export default function Transfer() {
//   const { user } = useAuth()
//   const [acc, setAcc] = useState(null)
//   const [txs, setTxs] = useState([])
//   const [f, setF] = useState({ acc: '', amount: '', remarks: '' })
//   const [step, setStep] = useState('form')
//   const [err, setErr] = useState('')
//   const [busy, setBusy] = useState(false)
//   const [done, setDone] = useState(null)
//   const [to, setTo] = useState(null)

//   useEffect(() => {
//     if (!user?.customerId) return
//     findMyAccount(getAccounts, user.customerId).then(async (a) => {
//       setAcc(a)
//       if (a) {
//         const raw = await getAccountTransactions(a.accountNumber)
//         setTxs(raw || [])
//       }
//     }).catch(() => {})
//   }, [user])

//   // beneficiary lookup when 12 digits entered
//   useEffect(() => {
//     setTo(null)
//     if (!/^\d{12}$/.test(f.acc) || f.acc === acc?.accountNumber) return
//     getAccount(f.acc).then(setTo).catch(() => setTo(null))
//   }, [f.acc, acc])

//   const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

//   const recent = []
//   txs.forEach((t) => {
//     const other = t.sourceAccount === acc?.accountNumber ? t.destinationAccount : t.sourceAccount
//     if (other && other !== acc?.accountNumber && !recent.some((r) => r.acc === other)) {
//       recent.push({ acc: other })
//     }
//   })

//   const balance = Number(acc?.balance ?? 0)

//   const review = (e) => {
//     e.preventDefault()
//     const a = Number(f.amount)
//     if (!/^\d{12}$/.test(f.acc)) return setErr('Enter the 12-digit account number.')
//     if (!to) return setErr('No account found with this number.')
//     if (f.acc === acc?.accountNumber) return setErr('You cannot transfer to your own account.')
//     if (!(a > 0)) return setErr('Enter an amount greater than zero.')
//     if (a > balance) return setErr(`Your available balance is ${inr(balance)}.`)
//     setErr(''); setStep('review')
//   }

//   const confirm = async () => {
//     setBusy(true)
//     try {
//       const res = await doTransfer({
//         transactionId: newTxnId(),
//         type: 'TRANSFER',
//         amount: Number(f.amount),
//         sourceAccount: acc.accountNumber,
//         destinationAccount: f.acc,
//       })
//       if (res.status !== 'SUCCESS') throw new Error(res.message || 'Transfer failed')
//       setDone(res); setStep('done')
//       // refresh balance + txs
//       const raw = await getAccountTransactions(acc.accountNumber)
//       setTxs(raw || [])
//       const fresh = await getAccount(acc.accountNumber)
//       setAcc(fresh)
//     } catch (x) { setErr(x.message); setStep('form') }
//     setBusy(false)
//   }

//   const reset = () => { setF({ acc: '', amount: '', remarks: '' }); setStep('form'); setDone(null); setErr('') }

//   if (step === 'done') return (
//     <Page title="Transfer" sub="Transfer complete.">
//       <div className="card" style={{ maxWidth: 520 }}>
//         <h3>{inr(done.amount)} sent</h3>
//         <div className="lrow"><span className="k">Reference</span><span>{done.transactionId}</span></div>
//         <div className="lrow"><span className="k">To account</span><span>{done.destinationAccount}</span></div>
//         <div className="lrow"><span className="k">New balance</span><b>{inr(acc?.balance ?? 0)}</b></div>
//         <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
//           <button className="btn p" onClick={reset}>Make another transfer</button>
//           <Link className="btn" to="/customer/transactions">View transactions</Link>
//         </div>
//       </div>
//     </Page>
//   )

//   return (
//     <Page title="Transfer" sub="Send money to another account.">
//       <div className="grid g2">
//         {step === 'review' ? (
//           <div className="card">
//             <h3>Review and confirm</h3>
//             <div className="lrow"><span className="k">From</span><span>{acc?.accountNumber} – {inr(balance)}</span></div>
//             <div className="lrow"><span className="k">To</span><span>{to?.customerName || f.acc} ({f.acc})</span></div>
//             <div className="lrow"><span className="k">Amount</span><b>{inr(f.amount)}</b></div>
//             <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
//               <button className="btn p" onClick={confirm} disabled={busy}>{busy ? 'Processing…' : `Send ${inr(f.amount)}`}</button>
//               <button className="btn" onClick={() => setStep('form')} disabled={busy}>Edit</button>
//             </div>
//           </div>
//         ) : (
//           <form className="card" onSubmit={review}>
//             <h3>New transfer</h3>
//             {err && <div className="alert" role="alert">{err}</div>}
//             <div className="f"><label>From</label><input disabled value={`${acc?.accountNumber || '…'} – ${inr(balance)}`} /></div>
//             <div className="f">
//               <label htmlFor="acc">Beneficiary account number</label>
//               <input id="acc" inputMode="numeric" maxLength={20} placeholder="Account number" value={f.acc} onChange={(e) => setF({ ...f, acc: e.target.value.replace(/\s/g, '') })} />
//               {to && <div className="sub up" style={{ marginTop: 5 }}>Account holder: {to.customerName}</div>}
//             </div>
//             <div className="f"><label htmlFor="amt">Amount (₹)</label><input id="amt" inputMode="decimal" placeholder="0.00" value={f.amount} onChange={set('amount')} /></div>
//             <div className="f"><label htmlFor="rm">Remarks (optional)</label><input id="rm" maxLength={60} value={f.remarks} onChange={set('remarks')} /></div>
//             <button className="btn p">Review transfer</button>
//           </form>
//         )}
//         <div className="card">
//           <h3>Recent recipients</h3>
//           {recent.length === 0 && <p className="k">Accounts you send money to will appear here.</p>}
//           {recent.map((r) => (
//             <div className="lrow" key={r.acc}>
//               <div><div>Account</div><div className="sub">{r.acc}</div></div>
//               <button className="btn s" onClick={() => { setStep('form'); setF({ ...f, acc: r.acc }) }}>Use</button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Page>
//   )
// }





import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAccounts, getAccount, getAccountTransactions, doTransfer } from '../../api/client.js'
import { findMyAccount } from '../../api/mappers.js'
import { Page, inr } from '../../components/ui.jsx'

const newTxnId = () => 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

export default function Transfer() {
  const { user } = useAuth()
  const [acc, setAcc] = useState(null)
  const [txs, setTxs] = useState([])
  const [sp] = useSearchParams()
  const [f, setF] = useState({ acc: sp.get('to') || '', amount: '', remarks: '' })
  const [step, setStep] = useState('form')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [to, setTo] = useState(null)

  useEffect(() => {
    if (!user?.customerId) return
    findMyAccount(getAccounts, user.customerId).then(async (a) => {
      setAcc(a)
      if (a) {
        const raw = await getAccountTransactions(a.accountNumber)
        setTxs(raw || [])
      }
    }).catch(() => {})
  }, [user])

  // beneficiary lookup when 12 digits entered
  useEffect(() => {
    setTo(null)
    if (!/^\d{12}$/.test(f.acc) || f.acc === acc?.accountNumber) return
    getAccount(f.acc).then(setTo).catch(() => setTo(null))
  }, [f.acc, acc])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const recent = []
  txs.forEach((t) => {
    const other = t.sourceAccount === acc?.accountNumber ? t.destinationAccount : t.sourceAccount
    if (other && other !== acc?.accountNumber && !recent.some((r) => r.acc === other)) {
      recent.push({ acc: other })
    }
  })

  const balance = Number(acc?.balance ?? 0)

  const review = (e) => {
    e.preventDefault()
    const a = Number(f.amount)
    if (!/^\d{12}$/.test(f.acc)) return setErr('Enter the 12-digit account number.')
    if (!to) return setErr('No account found with this number.')
    if (f.acc === acc?.accountNumber) return setErr('You cannot transfer to your own account.')
    if (!(a > 0)) return setErr('Enter an amount greater than zero.')
    if (a > balance) return setErr(`Your available balance is ${inr(balance)}.`)
    setErr(''); setStep('review')
  }

  const confirm = async () => {
    setBusy(true)
    try {
      const res = await doTransfer({
        transactionId: newTxnId(),
        type: 'TRANSFER',
        amount: Number(f.amount),
        sourceAccount: acc.accountNumber,
        destinationAccount: f.acc,
      })
      if (res.status !== 'SUCCESS') throw new Error(res.message || 'Transfer failed')
      setDone(res); setStep('done')
      // refresh balance + txs
      const raw = await getAccountTransactions(acc.accountNumber)
      setTxs(raw || [])
      const fresh = await getAccount(acc.accountNumber)
      setAcc(fresh)
    } catch (x) { setErr(x.message); setStep('form') }
    setBusy(false)
  }

  const reset = () => { setF({ acc: '', amount: '', remarks: '' }); setStep('form'); setDone(null); setErr('') }

  if (step === 'done') return (
    <Page title="Transfer" sub="Transfer complete.">
      <div className="card" style={{ maxWidth: 520 }}>
        <h3>{inr(done.amount)} sent</h3>
        <div className="lrow"><span className="k">Reference</span><span>{done.transactionId}</span></div>
        <div className="lrow"><span className="k">To account</span><span>{done.destinationAccount}</span></div>
        <div className="lrow"><span className="k">New balance</span><b>{inr(acc?.balance ?? 0)}</b></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn p" onClick={reset}>Make another transfer</button>
          <Link className="btn" to="/customer/transactions">View transactions</Link>
        </div>
      </div>
    </Page>
  )

  return (
    <Page title="Transfer" sub="Send money to another account.">
      <div className="grid g2">
        {step === 'review' ? (
          <div className="card">
            <h3>Review and confirm</h3>
            <div className="lrow"><span className="k">From</span><span>{acc?.accountNumber} – {inr(balance)}</span></div>
            <div className="lrow"><span className="k">To</span><span>{to?.customerName || f.acc} ({f.acc})</span></div>
            <div className="lrow"><span className="k">Amount</span><b>{inr(f.amount)}</b></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn p" onClick={confirm} disabled={busy}>{busy ? 'Processing…' : `Send ${inr(f.amount)}`}</button>
              <button className="btn" onClick={() => setStep('form')} disabled={busy}>Edit</button>
            </div>
          </div>
        ) : (
          <form className="card" onSubmit={review}>
            <h3>New transfer</h3>
            {err && <div className="alert" role="alert">{err}</div>}
            <div className="f"><label>From</label><input disabled value={`${acc?.accountNumber || '…'} – ${inr(balance)}`} /></div>
            <div className="f">
              <label htmlFor="acc">Beneficiary account number</label>
              <input id="acc" inputMode="numeric" maxLength={20} placeholder="Account number" value={f.acc} onChange={(e) => setF({ ...f, acc: e.target.value.replace(/\s/g, '') })} />
              {to && <div className="sub up" style={{ marginTop: 5 }}>Account holder: {to.customerName}</div>}
            </div>
            <div className="f"><label htmlFor="amt">Amount (₹)</label><input id="amt" inputMode="decimal" placeholder="0.00" value={f.amount} onChange={set('amount')} /></div>
            <div className="f"><label htmlFor="rm">Remarks (optional)</label><input id="rm" maxLength={60} value={f.remarks} onChange={set('remarks')} /></div>
            <button className="btn p">Review transfer</button>
          </form>
        )}
        <div className="card">
          <h3>Recent recipients</h3>
          {recent.length === 0 && <p className="k">Accounts you send money to will appear here.</p>}
          {recent.map((r) => (
            <div className="lrow" key={r.acc}>
              <div><div>Account</div><div className="sub">{r.acc}</div></div>
              <button className="btn s" onClick={() => { setStep('form'); setF({ ...f, acc: r.acc }) }}>Use</button>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}
