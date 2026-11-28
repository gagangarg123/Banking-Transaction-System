import { useEffect, useState } from 'react'
import { getAccounts, freezeAccount, unfreezeAccount } from '../../api/client.js'
import { Kpi, Page, Tag, inr } from '../../components/ui.jsx'

const uiStatus = (s) => (s === 'ACTIVE' ? 'Active' : s === 'FROZEN' ? 'Frozen' : s)

export default function Accounts() {
  const [list, setList] = useState([])
  const load = () => getAccounts().then(setList).catch(() => {})
  useEffect(load, [])

  const toggle = async (a) => {
    try {
      if (a.status === 'ACTIVE') await freezeAccount(a.accountNumber)
      else await unfreezeAccount(a.accountNumber)
      load()
    } catch (e) { alert(e.message) }
  }

  return (
    <Page title="Account" sub="All customer accounts and balances.">
      <div className="grid g4">
        <Kpi k="Total accounts" v={list.length} s="All types" />
        <Kpi k="Active" v={list.filter((a) => a.status === 'ACTIVE').length} s="Can transact" />
        <Kpi k="Frozen" v={list.filter((a) => a.status === 'FROZEN').length} s="Blocked" />
        <Kpi k="Total balance" v={inr(list.reduce((s, a) => s + Number(a.balance || 0), 0))} s="All accounts" />
      </div>
      <div className="card"><div className="scroll"><table>
        <thead><tr><th>Account no.</th><th>Holder</th><th>Type</th><th className="r">Balance</th><th>Status</th><th /></tr></thead>
        <tbody>{list.map((a) => (
          <tr key={a.accountNumber}>
            <td>{a.accountNumber}</td><td>{a.customerName}</td><td>{a.accountType}</td>
            <td className="r">{inr(a.balance)}</td><td><Tag s={uiStatus(a.status)} /></td>
            <td className="r"><button className="btn s" onClick={() => toggle(a)}>
              {a.status === 'ACTIVE' ? 'Freeze' : 'Unfreeze'}</button></td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </Page>
  )
}
