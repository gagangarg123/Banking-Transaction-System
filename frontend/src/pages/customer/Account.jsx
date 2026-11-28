import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAccounts, getAccountTransactions } from '../../api/client.js'
import { findMyAccount, mapTransaction } from '../../api/mappers.js'
import { Page, Tag, fdate, inr } from '../../components/ui.jsx'

export default function Account() {
  const { user } = useAuth()
  const [acc, setAcc] = useState(null)
  const [txs, setTxs] = useState([])

  useEffect(() => {
    if (!user?.customerId) return
    findMyAccount(getAccounts, user.customerId).then(async (a) => {
      setAcc(a)
      if (a) {
        const raw = await getAccountTransactions(a.accountNumber)
        setTxs((raw || []).map((t) => mapTransaction(t, a.accountNumber)))
      }
    }).catch(() => {})
  }, [user])

  const today = new Date().toDateString()
  const used = txs
    .filter((t) => t.fromAcc === acc?.accountNumber && t.status === 'Completed' && new Date(t.date).toDateString() === today)
    .reduce((s, t) => s + t.amount, 0)

  const limit = Number(acc?.dailyTransferLimit ?? 50000)
  const status = acc?.status === 'ACTIVE' ? 'Active' : acc?.status === 'FROZEN' ? 'Frozen' : (acc?.status || '')
  const rows = [
    ['Account number', acc?.accountNumber || '—'],
    ['Account type', acc?.accountType || '—'],
    ['Daily withdrawal limit', inr(acc?.dailyWithdrawalLimit ?? 0)],
    ['Daily transfer limit', inr(acc?.dailyTransferLimit ?? 0)],
    ['Opened', acc?.createdAt ? fdate(acc.createdAt) : '—'],
  ]

  return (
    <Page title="Account" sub="Your account details and limits.">
      <div className="grid g2">
        <div className="card">
          <h3>Savings account <Tag s={status} /></h3>
          {rows.map(([k, v]) => <div className="lrow" key={k}><span className="k">{k}</span><span>{v}</span></div>)}
          <div className="lrow"><span className="k">Balance</span><b>{inr(acc?.balance ?? 0)}</b></div>
        </div>
        <div className="card">
          <h3>Daily transfer limit</h3>
          <div className="lrow" style={{ border: 0, paddingBottom: 6 }}><span className="k">Used today</span><span>{inr(used)} of {inr(limit)}</span></div>
          <div className="meter"><b style={{ width: Math.min((used / limit) * 100, 100) + '%' }} /></div>
          <p className="sub" style={{ marginTop: 12 }}>Share your account number so others can send you money.</p>
        </div>
      </div>
    </Page>
  )
}
