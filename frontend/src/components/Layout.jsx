import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Icon } from './ui.jsx'
import Logo from './Logo.jsx'


const NAV = {
  customer: [['dashboard', 'Dashboard', 'dash'], ['account', 'Account', 'acc'], ['transactions', 'Transactions', 'tx'], ['transfer', 'Transfer', 'tr'], ['profile', 'Profile', 'pr']],
  admin: [['dashboard', 'Dashboard', 'dash'], ['customers', 'Customers', 'cu'], ['account', 'Account', 'acc'], ['failed', 'Failed transactions', 'fail'], ['reports', 'Reports', 'rep']],
}

export default function Layout({ role }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="shell">
      <aside>
        {/* <div className="brand"><i>B</i><div>Banking System<small>{role === 'admin' ? 'Admin console' : 'Online banking'}</small></div></div> */}
         <div className="brand"><Logo sub={role === 'admin' ? 'Admin console' : 'Online banking'} /></div>
        <nav aria-label="Main">
          {NAV[role].map(([p, label, ic]) => (
            <NavLink key={p} to={`/${role}/${p}`}><Icon n={ic} />{label}</NavLink>
          ))}
        </nav>
        <div className="who">
          <div className="av">{initials}</div>
          <div className="grow"><span>{user.name}</span><small>{role === 'admin' ? 'Operations admin' : 'Customer'}</small></div>
          <button className="iconbtn" title="Sign out" aria-label="Sign out" onClick={() => { logout(); nav('/login') }}><Icon n="out" /></button>
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  )
}
