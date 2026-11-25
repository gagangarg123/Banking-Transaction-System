import { useAuth } from '../../context/AuthContext.jsx'
import { txsFor, useDb } from '../../api/store.js'
import { Page, Tag, fdate, inr } from '../../components/ui.jsx'

const LIMIT = 200000

export default function Account() {
  const { user } = useAuth()
  useDb()
  const today = new Date().toDateString()
  const used = txsFor(user.id)
    .filter((t) => t.fromId === user.id && t.status === 'Completed' && new Date(t.date).toDateString() === today)
    .reduce((s, t) => s + t.amount, 0)
  const rows = [['Account number', user.accNo], ['IFSC', 'NGBK0001204'], ['Account type', 'Savings'], ['Branch', 'Rajpura, Punjab'], ['Opened', fdate(user.created)]]

  return (
    <Page title="Account" sub="Your account details and limits.">
      <div className="grid g2">
        <div className="card">
          <h3>Savings account <Tag s={user.status} /></h3>
          {rows.map(([k, v]) => <div className="lrow" key={k}><span className="k">{k}</span><span>{v}</span></div>)}
          <div className="lrow"><span className="k">Balance</span><b>{inr(user.balance)}</b></div>
        </div>
        <div className="card">
          <h3>Daily transfer limit</h3>
          <div className="lrow" style={{ border: 0, paddingBottom: 6 }}><span className="k">Used today</span><span>{inr(used)} of {inr(LIMIT)}</span></div>
          <div className="meter"><b style={{ width: Math.min((used / LIMIT) * 100, 100) + '%' }} /></div>
          <p className="sub" style={{ marginTop: 12 }}>Share your account number so others can send you money.</p>
        </div>
      </div>
    </Page>
  )
}
