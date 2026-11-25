import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { last7, txsFor, useDb } from '../../api/store.js'
import { Bars, Kpi, Page, TxTable, inr } from '../../components/ui.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  useDb()
  const txs = txsFor(user.id)
  const done = txs.filter((t) => t.status === 'Completed')
  const month = (t) => new Date(t.date).getMonth() === new Date().getMonth()
  const sum = (a) => a.reduce((s, t) => s + t.amount, 0)
  const moneyIn = sum(done.filter((t) => t.toId === user.id && month(t)))
  const moneyOut = sum(done.filter((t) => t.fromId === user.id && month(t)))

  return (
    <Page title="Dashboard" sub={`Welcome back, ${user.name.split(' ')[0]}.`} action={<Link className="btn p" to="/customer/transfer">New transfer</Link>}>
      <div className="grid g4">
        <Kpi hero k="Available balance" v={inr(user.balance)} s={`Savings ••${user.accNo.slice(-4)}`} />
        <Kpi k="Money in this month" v={inr(moneyIn)} s={<span className="up">Credits received</span>} />
        <Kpi k="Money out this month" v={inr(moneyOut)} s="Transfers sent" />
        <Kpi k="Failed transfers" v={txs.filter((t) => t.status === 'Failed' && t.fromId === user.id).length} s="Last 30 days" />
      </div>
      <div className="card">
        <h3>Money sent, last 7 days</h3>
        <Bars data={last7(txs, (t) => t.fromId === user.id)} />
      </div>
      <div className="card">
        <h3>Recent transactions <Link className="lnk" to="/customer/transactions">View all</Link></h3>
        <TxTable rows={txs.slice(0, 5)} me={user.id} />
      </div>
    </Page>
  )
}
