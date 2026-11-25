import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateProfile } from '../../api/store.js'
import { Page } from '../../components/ui.jsx'

export default function Profile() {
  const { user } = useAuth()
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => { setSaved(false); setF({ ...f, [k]: e.target.value }) }
  const save = (e) => { e.preventDefault(); updateProfile(user.id, f); setSaved(true) }

  return (
    <Page title="Profile" sub="Your personal details.">
      <form className="card" style={{ maxWidth: 640 }} onSubmit={save}>
        <div className="row">
          <div className="f"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set('name')} /></div>
          <div className="f"><label>Customer ID</label><input disabled value={user.id.toUpperCase()} /></div>
        </div>
        <div className="row">
          <div className="f"><label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} onChange={set('email')} /></div>
          <div className="f"><label htmlFor="m">Mobile</label><input id="m" required value={f.phone} onChange={set('phone')} /></div>
        </div>
        <button className="btn p">Save changes</button>
        {saved && <span className="up" style={{ marginLeft: 12 }}>Saved</span>}
      </form>
    </Page>
  )
}
