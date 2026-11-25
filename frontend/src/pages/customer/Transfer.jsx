import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { lookup, transfer, txsFor, useDb } from '../../api/store.js'
import { Page, inr } from '../../components/ui.jsx'

export default function Transfer() {
  const { user } = useAuth()
  useDb()
  const [f, setF] = useState({ acc: '', amount: '', remarks: '' })
  const [step, setStep] = useState('form')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)

  const to = f.acc.length === 12 ? lookup(f.acc) : null
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  // recent recipients, newest first, no duplicates
  const recent = []
  txsFor(user.id).filter((t) => t.fromId === user.id && t.toId).forEach((t) => {
    if (!recent.some((r) => r.acc === t.toAcc)) recent.push({ acc: t.toAcc, name: t.toName })
  })

  const review = (e) => {
    e.preventDefault()
    const a = Number(f.amount)
    if (!/^\d{12}$/.test(f.acc)) return setErr('Enter the 12-digit account number.')
    if (!to) return setErr('No account found with this number.')
    if (to.id === user.id) return setErr('You cannot transfer to your own account.')
    if (!(a > 0)) return setErr('Enter an amount greater than zero.')
    if (a > user.balance) return setErr(`Your available balance is ${inr(user.balance)}.`)
    setErr(''); setStep('review')
  }

  const confirm = async () => {
    setBusy(true)
    try { setDone(await transfer(user.id, { toAccNo: f.acc, amount: f.amount, remarks: f.remarks })); setStep('done') }
    catch (x) { setErr(x.message); setStep('form') }
    setBusy(false)
  }

  const reset = () => { setF({ acc: '', amount: '', remarks: '' }); setStep('form'); setDone(null); setErr('') }

  if (step === 'done') return (
    <Page title="Transfer" sub="Transfer complete.">
      <div className="card" style={{ maxWidth: 520 }}>
        <h3>{inr(done.amount)} sent to {done.toName}</h3>
        <div className="lrow"><span className="k">Reference</span><span>{done.id}</span></div>
        <div className="lrow"><span className="k">To account</span><span>{done.toAcc}</span></div>
        <div className="lrow"><span className="k">New balance</span><b>{inr(user.balance)}</b></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn p" onClick={reset}>Make another transfer</button>
          <Link className="btn" to="/customer/transactions">View transactions</Link>
        </div>
      </div>
    </Page>
  )

  return (
    <Page title="Transfer" sub="Send money to another Banking System account. Daily limit ₹2,00,000.">
      <div className="grid g2">
        {step === 'review' ? (
          <div className="card">
            <h3>Review and confirm</h3>
            <div className="lrow"><span className="k">From</span><span>Savings ••{user.accNo.slice(-4)}</span></div>
            <div className="lrow"><span className="k">To</span><span>{to.name} ({f.acc})</span></div>
            <div className="lrow"><span className="k">Amount</span><b>{inr(f.amount)}</b></div>
            {f.remarks && <div className="lrow"><span className="k">Remarks</span><span>{f.remarks}</span></div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn p" onClick={confirm} disabled={busy}>{busy ? 'Processing…' : `Send ${inr(f.amount)}`}</button>
              <button className="btn" onClick={() => setStep('form')} disabled={busy}>Edit</button>
            </div>
          </div>
        ) : (
          <form className="card" onSubmit={review}>
            <h3>New transfer</h3>
            {err && <div className="alert" role="alert">{err}</div>}
            <div className="f"><label>From</label><input disabled value={`Savings ••${user.accNo.slice(-4)} – ${inr(user.balance)}`} /></div>
            <div className="f">
              <label htmlFor="acc">Beneficiary account number</label>
              <input id="acc" inputMode="numeric" maxLength={12} placeholder="12-digit account number" value={f.acc} onChange={(e) => setF({ ...f, acc: e.target.value.replace(/\D/g, '') })} />
              {f.acc.length === 12 && <div className={'sub ' + (to ? 'up' : 'dn')} style={{ marginTop: 5 }}>{to ? `Account holder: ${to.name}` : 'No account found'}</div>}
            </div>
            <div className="f"><label htmlFor="amt">Amount (₹)</label><input id="amt" inputMode="decimal" placeholder="0.00" value={f.amount} onChange={set('amount')} /></div>
            <div className="f"><label htmlFor="rm">Remarks (optional)</label><input id="rm" maxLength={60} value={f.remarks} onChange={set('remarks')} /></div>
            <button className="btn p">Review transfer</button>
          </form>
        )}
        <div className="card">
          <h3>Recent recipients</h3>
          {recent.length === 0 && <p className="k">People you send money to will appear here.</p>}
          {recent.map((r) => (
            <div className="lrow" key={r.acc}>
              <div><div>{r.name}</div><div className="sub">{r.acc}</div></div>
              <button className="btn s" onClick={() => { setStep('form'); setF({ ...f, acc: r.acc }) }}>Use</button>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}
