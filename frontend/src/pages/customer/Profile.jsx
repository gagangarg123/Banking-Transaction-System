import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../api/client.js'
import { Page } from '../../components/ui.jsx'

export default function Profile() {
  const { user } = useAuth()
  const [f, setF] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    if (!user?.customerId) return
    api(`/api/customers/${user.customerId}`)
      .then((c) => setF({ name: c.name || '', email: c.email || '', phone: c.phone || '' }))
      .catch(() => {})
  }, [user])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  return (
    <Page title="Profile" sub="Your personal details.">
      <form className="card" style={{ maxWidth: 640 }}>
        <div className="row">
          <div className="f"><label htmlFor="n">Full name</label><input id="n" required value={f.name} readOnly /></div>
          <div className="f"><label>Customer ID</label><input disabled value={user.customerId ?? ''} /></div>
        </div>
        <div className="row">
          <div className="f"><label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} readOnly /></div>
          <div className="f"><label htmlFor="m">Mobile</label><input id="m" required value={f.phone} readOnly /></div>
        </div>
        <p className="sub">Profile editing is read-only for now — contact the branch to update details.</p>
      </form>
    </Page>
  )
}
