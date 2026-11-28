import { useEffect, useState } from 'react'
import { getCustomers, getAccounts, onboardCustomer, freezeAccount, unfreezeAccount } from '../../api/client.js'
import { Page, Tag, fdate, inr } from '../../components/ui.jsx'

const genAccNo = () => '5' + String(Math.floor(Math.random() * 1e11)).padStart(11, '0')
const blank = () => ({ name: '', email: '', phone: '', deposit: '1000', password: '' })
const toUiStatus = (s) => (s === 'ACTIVE' ? 'Active' : s === 'FROZEN' ? 'Frozen' : s)

function AddCustomer({ onClose, onCreated }) {
  const [f, setF] = useState(blank())
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s/g, ''))) return setErr('Enter a valid 10-digit mobile number.')
    if (!(Number(f.deposit) >= 0)) return setErr('Opening deposit cannot be negative.')
    if (f.password.length < 8) return setErr('Password must be at least 8 characters.')
    setErr(''); setBusy(true)
    try {
      // single call: creates customer + account + emails credentials
      const res = await onboardCustomer({
        name: f.name.trim(), email: f.email.trim(), phone: f.phone,
        password: f.password, deposit: Number(f.deposit) || 0,
      })
      setCreated({ name: res.name, email: res.email, accNo: res.accountNumber, balance: Number(f.deposit) || 0, pw: f.password })
      onCreated?.()
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  if (created) return (
    <div className="card">
      <h3>Customer added</h3>
      <div className="lrow"><span className="k">Name</span><span>{created.name}</span></div>
      <div className="lrow"><span className="k">Account number</span><b>{created.accNo}</b></div>
      <div className="lrow"><span className="k">Login email</span><span>{created.email}</span></div>
      <div className="lrow"><span className="k">Opening balance</span><span>{inr(created.balance)}</span></div>
      <div className="lrow"><span className="k">Password</span><b>{created.pw}</b></div>
      <p className="sub">Share these details with the customer securely.</p>
      <button className="btn p" onClick={onClose}>Done</button>
    </div>
  )

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add customer</h3>
      {err && <div className="alert" role="alert">{err}</div>}
      <div className="row">
        <div className="f"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set('name')} /></div>
        <div className="f"><label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} onChange={set('email')} /></div>
      </div>
      <div className="row">
        <div className="f"><label htmlFor="m">Mobile</label><input id="m" inputMode="numeric" required value={f.phone} onChange={set('phone')} /></div>
        <div className="f"><label htmlFor="d">Opening deposit (₹)</label><input id="d" inputMode="decimal" required value={f.deposit} onChange={set('deposit')} /></div>
      </div>
      <div className="f" style={{ maxWidth: 'calc(50% - 7px)' }}><label htmlFor="p">Password (min 8 chars)</label><input id="p" required minLength={8} value={f.password} onChange={set('password')} /></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn p" disabled={busy}>{busy ? 'Creating…' : 'Create customer and account'}</button>
        <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </form>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [accounts, setAccounts]   = useState([])
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)

  const load = () => {
    getCustomers().then(setCustomers).catch(() => {})
    getAccounts().then(setAccounts).catch(() => {})
  }
  useEffect(load, [])

  // join customer + their account (account carries customerId + customerName)
  const accByCust = Object.fromEntries(accounts.map((a) => [a.customerId, a]))
  const rows = customers
    .map((c) => ({ ...c, acc: accByCust[c.id] }))
    .filter((c) => `${c.name} ${c.email} ${c.phone} ${c.acc?.accountNumber || ''}`.toLowerCase().includes(q.toLowerCase()))

  const toggleFreeze = async (acc) => {
    try {
      if (acc.status === 'ACTIVE') await freezeAccount(acc.accountNumber)
      else await unfreezeAccount(acc.accountNumber)
      load()
    } catch (e) { alert(e.message) }
  }

  return (
    <Page title="Customers" sub={`${customers.length} registered customers.`}
      action={!adding && <button className="btn p" onClick={() => setAdding(true)}>Add customer</button>}>
      {adding && <AddCustomer onClose={() => setAdding(false)} onCreated={load} />}
      <div className="card">
        <div className="filters"><input placeholder="Search by name, email, phone or account" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="scroll"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Account</th><th>Balance</th><th>Status</th><th /></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td>
              <td>{c.acc?.accountNumber || '—'}</td>
              <td>{c.acc ? inr(c.acc.balance) : '—'}</td>
              <td><Tag s={toUiStatus(c.acc?.status)} /></td>
              <td className="r">{c.acc && (
                <button className="btn s" onClick={() => toggleFreeze(c.acc)}>
                  {c.acc.status === 'ACTIVE' ? 'Freeze' : 'Unfreeze'}
                </button>
              )}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </Page>
  )
}
