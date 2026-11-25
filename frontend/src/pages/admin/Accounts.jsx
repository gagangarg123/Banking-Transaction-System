import { customers, setStatus, useDb } from '../../api/store.js'
import { Kpi, Page, Tag, inr } from '../../components/ui.jsx'

export default function Accounts() {
  useDb()
  const list = customers()
  return (
    <Page title="Account" sub="All customer accounts and balances.">
      <div className="grid g4">
        <Kpi k="Total accounts" v={list.length} s="Savings" />
        <Kpi k="Active" v={list.filter((c) => c.status === 'Active').length} s="Can send and receive" />
        <Kpi k="Frozen" v={list.filter((c) => c.status === 'Frozen').length} s="Blocked" />
        <Kpi k="Total deposits" v={inr(list.reduce((s, c) => s + c.balance, 0))} s="All accounts" />
      </div>
      <div className="card"><div className="scroll"><table>
        <thead><tr><th>Account no.</th><th>Holder</th><th>Type</th><th className="r">Balance</th><th>Status</th><th /></tr></thead>
        <tbody>{list.map((c) => (
          <tr key={c.id}><td>{c.accNo}</td><td>{c.name}</td><td>Savings</td><td className="r">{inr(c.balance)}</td><td><Tag s={c.status} /></td>
            <td className="r"><button className="btn s" onClick={() => setStatus(c.id, c.status === 'Active' ? 'Frozen' : 'Active')}>{c.status === 'Active' ? 'Freeze' : 'Unfreeze'}</button></td></tr>
        ))}</tbody>
      </table></div></div>
    </Page>
  )
}
