import { useState } from 'react'
import { addCustomer, customers, setStatus, useDb } from '../../api/store.js'
import { Page, Tag, fdate, inr } from '../../components/ui.jsx'

const tempPw = () => Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6).toUpperCase() + '#7'
const blank = () => ({ name: '', email: '', phone: '', deposit: '1000', password: tempPw() })

function AddCustomer({ onClose }) {
  const [f, setF] = useState(blank())
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s/g, ''))) return setErr('Enter a valid 10-digit mobile number.')
    if (!(Number(f.deposit) >= 0)) return setErr('Opening deposit cannot be negative.')
    if (f.password.length < 8) return setErr('Temporary password must be at least 8 characters.')
    setErr(''); setBusy(true)
    try { setCreated({ ...(await addCustomer(f)), pw: f.password }) } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  if (created) return (
    <div className="card">
      <h3>Customer added</h3>
      <div className="lrow"><span className="k">Name</span><span>{created.name}</span></div>
      <div className="lrow"><span className="k">Account number</span><b>{created.accNo}</b></div>
      <div className="lrow"><span className="k">Login email</span><span>{created.email}</span></div>
      <div className="lrow"><span className="k">Temporary password</span><b>{created.pw}</b></div>
      <div className="lrow"><span className="k">Opening balance</span><span>{inr(created.balance)}</span></div>
      <p className="sub">Share these details with the customer securely. This password is not shown again.</p>
      <button className="btn p" onClick={onClose}>Done</button>
    </div>
  )

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add customer</h3>
      {err && <div className="alert" role="alert">{err}</div>}
      <div className="row">
        <div className="f"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set('name')} /></div>
        <div className="f"><label htmlFor="e">Email (login ID)</label><input id="e" type="email" required value={f.email} onChange={set('email')} /></div>
      </div>
      <div className="row">
        <div className="f"><label htmlFor="m">Mobile</label><input id="m" inputMode="numeric" required value={f.phone} onChange={set('phone')} /></div>
        <div className="f"><label htmlFor="d">Opening deposit (₹)</label><input id="d" inputMode="decimal" required value={f.deposit} onChange={set('deposit')} /></div>
      </div>
      <div className="f" style={{ maxWidth: 'calc(50% - 7px)' }}><label htmlFor="p">Temporary password</label><input id="p" required value={f.password} onChange={set('password')} /></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn p" disabled={busy}>{busy ? 'Creating…' : 'Create customer and account'}</button>
        <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </form>
  )
}

export default function Customers() {
  useDb()
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const rows = customers().filter((c) => `${c.name} ${c.email} ${c.phone} ${c.accNo}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <Page title="Customers" sub={`${customers().length} registered customers.`}
      action={!adding && <button className="btn p" onClick={() => setAdding(true)}>Add customer</button>}>
      {adding && <AddCustomer onClose={() => setAdding(false)} />}
      <div className="card">
        <div className="filters"><input placeholder="Search by name, email, phone or account" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="scroll"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Account</th><th>Joined</th><th>Status</th><th /></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.accNo}</td><td>{fdate(c.created)}</td><td><Tag s={c.status} /></td>
              <td className="r"><button className="btn s" onClick={() => setStatus(c.id, c.status === 'Active' ? 'Frozen' : 'Active')}>{c.status === 'Active' ? 'Freeze' : 'Unfreeze'}</button></td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </Page>
  )
}
