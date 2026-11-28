// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../../context/AuthContext.jsx'
// import {logo} from '../../components/Logo.jsx'

// const ROLES = {
//   customer: {
//     title: 'Customer login',
//     sub: 'Access your accounts, transfers and statements.',
//     demo: { email: 'rohan@example.com', password: 'demo123' },
//     help: 'Accounts are opened by the bank. To get access, contact your branch.',
//     icon: 'M16 8a4 4 0 11-8 0 4 4 0 018 0zM4 21c1-4 4-6 8-6s7 2 8 6',
//   },
//   admin: {
//     title: 'Admin login',
//     sub: 'Manage customers, accounts and failed transactions.',
//     demo: { email: 'admin@bankingsystem.com', password: 'admin123' },
//     help: 'Admin access is issued by the system administrator.',
//     icon: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
//   },
// }

// export default function Login() {
//   const { login } = useAuth()
//   const nav = useNavigate()
//   const [role, setRole] = useState('customer')
//   const [f, setF] = useState({ email: '', password: '' })
//   const [show, setShow] = useState(false)
//   const [err, setErr] = useState('')
//   const [busy, setBusy] = useState(false)
//   const r = ROLES[role]
//   const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

//   const pick = (x) => { setRole(x); setF({ email: '', password: '' }); setErr('') }

//   const submit = async (e) => {
//     e.preventDefault()
//     setErr(''); setBusy(true)
//     try { const u = await login(f.email, f.password, role); nav(`/${u.role}/dashboard`) }
//     catch (x) { setErr(x.message); setBusy(false) }
//   }

//   return (
//     // <div className="login">
//     //   <div className="brand"><i>B</i><div>Banking System</div></div>
//     //   <div className="login-card">
//     //     <div className="tabs" role="tablist" aria-label="Login type">
//     //       {Object.entries(ROLES).map(([key, v]) => (
//     //         <button key={key} type="button" role="tab" aria-selected={role === key} onClick={() => pick(key)}>
//     //           <svg viewBox="0 0 24 24" className="ico"><path d={v.icon} /></svg>
//     //           {key === 'customer' ? 'Customer' : 'Admin'}
//     //         </button>
//     //       ))}
//     //     </div>
//     //     <form onSubmit={submit}>
//     //       <h1>{r.title}</h1>
//     //       <p className="k">{r.sub}</p>
//     //       {err && <div className="alert" role="alert">{err}</div>}
//     //       <div className="f">
//     //         <label htmlFor="e">Email</label>
//     //         <input id="e" type="email" autoComplete="username" required value={f.email} onChange={set('email')} />
//     //       </div>
//     //       <div className="f">
//     //         <label htmlFor="p">Password</label>
//     //         <div className="pw">
//     //           <input id="p" type={show ? 'text' : 'password'} autoComplete="current-password" required value={f.password} onChange={set('password')} />
//     //           <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
//     //         </div>
//     //       </div>
//     //       <button className="btn p wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

//     //       {/* Demo credentials: remove this block when real credentials are issued */}
//     //       <div className="demo">
//     //         <div className="demo-h"><b>Demo credentials</b><button type="button" onClick={() => { setF(r.demo); setErr('') }}>Fill in</button></div>
//     //         <div className="r"><span>Email</span><span className="v">{r.demo.email}</span></div>
//     //         <div className="r"><span>Password</span><span className="v">{r.demo.password}</span></div>
//     //       </div>
//     //       <p className="help">{r.help}</p>
//     //     </form>
//     //   </div>
//     //   <div className="login-foot">© 2026 Banking System. Transactions are encrypted and monitored.</div>
//     // </div>




      
//     <div className="login">
//       <section className="login-hero">
//         <div className="brand"><i>B</i><div>Banking System</div></div>
//         <div className="hero-text">
//           <h2>Move money safely, every time.</h2>
//           <p>Every transfer is processed one account at a time, so balances stay correct even when many people pay at once.</p>
//           <ul>
//             <li>Instant transfers between accounts</li>
//             <li>Real-time failure monitoring</li>
//             <li>A full record of every transaction</li>
//           </ul>
//         </div>
//         <small>© 2026 Banking System</small>
//       </section>

//       <section className="login-main">
//         <div className="login-card">
//           <div className="tabs" role="tablist" aria-label="Login type">
//             {Object.entries(ROLES).map(([key, v]) => (
//               <button key={key} type="button" role="tab" aria-selected={role === key} onClick={() => pick(key)}>
//                 <svg viewBox="0 0 24 24" className="ico"><path d={v.icon} /></svg>
//                 {key === 'customer' ? 'Customer' : 'Admin'}
//               </button>
//             ))}
//           </div>
//           <form onSubmit={submit}>
//             <h1>{r.title}</h1>
//             <p className="k">{r.sub}</p>
//             {err && <div className="alert" role="alert">{err}</div>}
//             <div className="f">
//               <label htmlFor="e">Email</label>
//               <input id="e" type="email" autoComplete="username" required value={f.email} onChange={set('email')} />
//             </div>
//             <div className="f">
//               <label htmlFor="p">Password</label>
//               <div className="pw">
//                 <input id="p" type={show ? 'text' : 'password'} autoComplete="current-password" required value={f.password} onChange={set('password')} />
//                 <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
//               </div>
//             </div>
//             <button className="btn p wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

//             {/* Demo credentials: remove this block when real credentials are issued */}
//             <div className="demo">
//               <div className="demo-h"><b>Demo credentials</b><button type="button" onClick={() => { setF(r.demo); setErr('') }}>Fill in</button></div>
//               <div className="r"><span>Email</span><span className="v">{r.demo.email}</span></div>
//               <div className="r"><span>Password</span><span className="v">{r.demo.password}</span></div>
//             </div>
//             <p className="help">{r.help}</p>
//           </form>
//         </div>
//       </section>
//     </div>
      
//   )
// }
//   // )
// // }




import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { DEMO_MODE, resetDemo } from '../../api/client.js'
import Logo from '../../components/Logo.jsx'

const ROLES = {
  customer: {
    title: 'Customer login',
    sub: 'Access your accounts, transfers and statements.',
    demo: { email: 'rohan@example.com', password: 'demo123' },
    help: 'Accounts are opened by the bank. To get access, contact your branch.',
    icon: 'M16 8a4 4 0 11-8 0 4 4 0 018 0zM4 21c1-4 4-6 8-6s7 2 8 6',
  },
  admin: {
    title: 'Admin login',
    sub: 'Manage customers, accounts and failed transactions.',
    demo: { email: 'admin@bankingsystem.com', password: 'admin123' },
    help: 'Admin access is issued by the system administrator.',
    icon: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
  },
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [role, setRole] = useState('customer')
  const [f, setF] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const r = ROLES[role]
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const pick = (x) => { setRole(x); setF({ email: '', password: '' }); setErr('') }

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { const u = await login(f.email, f.password, role); nav(`/${u.role}/dashboard`) }
    catch (x) { setErr(x.message); setBusy(false) }
  }

  return (
    <div className="login">
      <section className="login-hero">
        <div className="brand"><Logo size={34} /></div>
        <div className="hero-text">
          <h2>Move money safely, every time.</h2>
          <p>Every transfer is processed one account at a time, so balances stay correct even when many people pay at once.</p>
          <ul>
            <li>Instant transfers between accounts</li>
            <li>Real-time failure monitoring</li>
            <li>A full record of every transaction</li>
          </ul>
        </div>
        <small>© 2026 Banking System</small>
      </section>

      <section className="login-main">
        <div className="login-card">
          <div className="tabs" role="tablist" aria-label="Login type">
            {Object.entries(ROLES).map(([key, v]) => (
              <button key={key} type="button" role="tab" aria-selected={role === key} onClick={() => pick(key)}>
                <svg viewBox="0 0 24 24" className="ico"><path d={v.icon} /></svg>
                {key === 'customer' ? 'Customer' : 'Admin'}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            <h1>{r.title}</h1>
            <p className="k">{r.sub}</p>
            {err && <div className="alert" role="alert">{err}</div>}
            <div className="f">
              <label htmlFor="e">Email</label>
              <input id="e" type="email" autoComplete="username" required value={f.email} onChange={set('email')} />
            </div>
            <div className="f">
              <label htmlFor="p">Password</label>
              <div className="pw">
                <input id="p" type={show ? 'text' : 'password'} autoComplete="current-password" required value={f.password} onChange={set('password')} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <button className="btn p wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

            {/* Demo credentials: shown only while DEMO_MODE is true in api/client.js */}
            {DEMO_MODE && (
              <div className="demo">
                <div className="demo-h"><b>Demo credentials</b><button type="button" onClick={() => { setF(r.demo); setErr('') }}>Fill in</button></div>
                <div className="r"><span>Email</span><span className="v">{r.demo.email}</span></div>
                <div className="r"><span>Password</span><span className="v">{r.demo.password}</span></div>
                <button type="button" className="linkbtn" onClick={() => { resetDemo(); setErr(''); setF({ email: '', password: '' }) }}>Reset demo data</button>
              </div>
            )}
            <p className="help">{r.help}</p>
          </form>
        </div>
      </section>
    </div>
  )
}
