export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
export const fdate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
export const ftime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const PATHS = {
  dash: 'M3 12l9-8 9 8M5 10v10h14V10',
  acc: 'M3 8a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 10h18',
  tx: 'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
  tr: 'M5 12h14M13 6l6 6-6 6',
  pr: 'M16 8a4 4 0 11-8 0 4 4 0 018 0zM4 21c1-4 4-6 8-6s7 2 8 6',
  cu: 'M12.5 8a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM2 20c1-3.5 3.5-5 7-5s6 1.5 7 5M16 4.5a3.5 3.5 0 010 7M18 15c2 .6 3.400 2.200 4 5',
  fail: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 7v6M12 16.500v.5',
  rep: 'M5 20V10M12 20V4M19 20v-7',
  out: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
}
export const Icon = ({ n }) => (
  <svg viewBox="0 0 24 24" className="ico"><path d={PATHS[n]} /></svg>
)

const TAGS = { Completed: 'ok', Active: 'ok', Pending: 'warn', Retrying: 'warn', Frozen: 'bad', Failed: 'bad' }
export const Tag = ({ s }) => <span className={`tag t-${TAGS[s] || 'n'}`}>{s}</span>

export const Kpi = ({ k, v, s, hero }) => (
  <div className={'card' + (hero ? ' hero' : '')}>
    <div className="k">{k}</div>
    <div className="big">{v}</div>
    <div className="sub">{s}</div>
  </div>
)

export const Bars = ({ data }) => {
  const max = Math.max(...data.map((d) => d[1]), 1)
  return (
    <div className="bars">
      {data.map(([l, v]) => (
        <div key={l} title={inr(v)}>
          <b style={{ height: Math.max((v / max) * 100, 2) + '%' }} />
          {l}
        </div>
      ))}
    </div>
  )
}

export const Page = ({ title, sub, action, children }) => (
  <>
    <header className="top">
      <div><h1>{title}</h1><p>{sub}</p></div>
      <div>{action}</div>
    </header>
    <div className="content">{children}</div>
  </>
)

export const Empty = ({ text }) => <p className="k" style={{ padding: '16px 0' }}>{text}</p>

// shared transaction table for the customer portal
export function TxTable({ rows, me }) {
  if (!rows.length) return <Empty text="No transactions yet. Make your first transfer from the Transfer page." />
  return (
    <div className="scroll">
      <table>
        <thead><tr><th>Reference</th><th>Date</th><th>Description</th><th className="r">Amount</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((t) => {
            const out = t.fromId === me
            return (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{fdate(t.date)}</td>
                <td>
                  {out ? `Transfer to ${t.toName}` : `Received from ${t.fromName}`}
                  {t.remarks && <div className="sub">{t.remarks}</div>}
                  {t.status === 'Failed' && <div className="sub dn">{t.reason}</div>}
                </td>
                <td className={'r ' + (!out && t.status === 'Completed' ? 'up' : '')}>
                  {t.status === 'Completed' ? (out ? '−' : '+') : ''}{inr(t.amount)}
                </td>
                <td><Tag s={t.status} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
