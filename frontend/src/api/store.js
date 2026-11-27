// Mock backend (localStorage). Replace each function with a call to your Java REST API.
import { useEffect, useState } from 'react'

const KEY = 'nb_db'
const SESSION = 'nb_session'
const DAILY_LIMIT = 200000
const ago = (d) => new Date(Date.now() - d * 864e5).toISOString()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const thread = () => 'Worker-' + String(1 + Math.floor(Math.random() * 16)).padStart(2, '0')

const cust = (id, name, email, phone, accNo, balance, status = 'Active') => ({
  id, name, email, phone, password: 'demo123', role: 'customer', accNo, balance, status, created: ago(900),
})
const mk = (id, d, from, to, amount, status, reason = '', remarks = '') => ({
  id, date: ago(d), fromId: from.id, toId: to.id, fromAcc: from.accNo, toAcc: to.accNo,
  fromName: from.name, toName: to.name, amount, status, reason, remarks, thread: thread(),
})

function seed() {
  const admin = { id: 'u0', name: 'Ravi Kumar', email: 'admin@bankingsystem.com', phone: '98000 00000', password: 'admin123', role: 'admin' }
  const rohan = cust('u1', 'Rohan Mehta', 'rohan@example.com', '98123 40021', '501003983302', 57400)
  const anita = cust('u2', 'Anita Verma', 'anita@example.com', '97011 88342', '501003778814', 132000)
  const kapoor = cust('u3', 'S. Kapoor', 'kapoor@example.com', '99887 10456', '501003772095', 412900, 'Frozen')
  return {
    users: [admin, rohan, anita, kapoor],
    txs: [
      mk('TXN-100412', 0.2, anita, rohan, 25000, 'Completed', '', 'Project payment'),
      mk('TXN-100377', 1, rohan, anita, 5000, 'Completed', '', 'Rent share'),
      mk('TXN-100341', 2, rohan, kapoor, 30000, 'Failed', 'Account frozen'),
      mk('TXN-100298', 3, kapoor, anita, 12000, 'Completed'),
      mk('TXN-100255', 5, anita, rohan, 8200, 'Failed', 'Lock wait timeout'),
    ],
  }
}

const save = (d) => { localStorage.setItem(KEY, JSON.stringify(d)); return d }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY))
    if (!d) return save(seed())
    // demo mode: make sure the demo admin always exists, even if older saved data is present
    const demo = seed().users[0]
    const a = d.users.find((u) => u.role === 'admin')
    if (!a) d.users.unshift(demo)
    else if (a.email !== demo.email || a.password !== demo.password) Object.assign(a, { email: demo.email, password: demo.password })
    save(d)
    return d
  } catch { return save(seed()) }
}

let db = load()
const subs = new Set()
const commit = () => { save(db); subs.forEach((f) => f()) }
export const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }
export function useDb() {
  const [, set] = useState(0)
  useEffect(() => subscribe(() => set((n) => n + 1)), [])
  return db
}

// one transfer at a time, like a row lock on both accounts
let queue = Promise.resolve()
const locked = (fn) => { const p = queue.then(fn); queue = p.catch(() => {}); return p }

/* ---------- auth ---------- */
export const sessionUser = () => db.users.find((u) => u.id === localStorage.getItem(SESSION)) || null
export const logout = () => localStorage.removeItem(SESSION)

export async function login(email, password, role) {
  await sleep(400)
  const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
  if (!u) throw new Error('Email or password is incorrect.')
  if (role && u.role !== role)
    throw new Error(u.role === 'admin' ? 'This is an admin account. Use the Admin tab to sign in.' : 'This is a customer account. Use the Customer tab to sign in.')
  localStorage.setItem(SESSION, u.id)
  return u
}

// Admin only: customers cannot sign themselves up.
export async function addCustomer({ name, email, phone, password, deposit }) {
  await sleep(500)
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
    throw new Error('A customer with this email already exists.')
  let accNo
  do { accNo = '5010' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0') } while (db.users.some((u) => u.accNo === accNo))
  const u = { id: 'u' + Date.now(), name: name.trim(), email: email.trim(), phone, password, role: 'customer', accNo, balance: Number(deposit) || 0, status: 'Active', created: new Date().toISOString() }
  db.users.push(u)
  commit()
  return u
}

/* ---------- queries ---------- */
export const lookup = (accNo) => db.users.find((u) => u.role === 'customer' && u.accNo === accNo)
export const txsFor = (id) => db.txs.filter((t) => t.fromId === id || t.toId === id)
export const customers = () => db.users.filter((u) => u.role === 'customer')
export const last7 = (txs, pick) =>
  [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i)
    const sum = txs.filter((t) => t.status === 'Completed' && new Date(t.date).toDateString() === d.toDateString() && pick(t)).reduce((s, t) => s + t.amount, 0)
    return [d.toLocaleDateString('en-IN', { weekday: 'short' }), sum]
  })

/* ---------- transfers ---------- */
function validate(from, to, amt, ignoreTxId) {
  if (!(amt > 0)) return 'Enter an amount greater than zero.'
  if (!to) return 'Beneficiary account not found.'
  if (from.id === to.id) return 'You cannot transfer to your own account.'
  if (from.status !== 'Active') return 'Account frozen'
  if (to.status !== 'Active') return 'Beneficiary account is frozen.'
  if (from.balance < amt) return 'Insufficient balance'
  const today = new Date().toDateString()
  const spent = db.txs.filter((t) => t.fromId === from.id && t.status === 'Completed' && t.id !== ignoreTxId && new Date(t.date).toDateString() === today).reduce((s, t) => s + t.amount, 0)
  if (spent + amt > DAILY_LIMIT) return 'Daily limit exceeded'
  return null
}
const apply = (from, to, amt) => { from.balance -= amt; to.balance += amt }

export function transfer(fromId, { toAccNo, amount, remarks }) {
  return locked(async () => {
    await sleep(700)
    const from = db.users.find((u) => u.id === fromId)
    const to = lookup(toAccNo)
    const amt = Number(amount)
    const reason = validate(from, to, amt)
    const t = { id: 'TXN-' + (100000 + db.txs.length + 500), date: new Date().toISOString(), fromId, toId: to?.id, fromAcc: from.accNo, toAcc: toAccNo, fromName: from.name, toName: to?.name || 'Unknown', amount: amt, remarks: remarks || '', thread: thread() }
    if (reason) {
      if (to) { db.txs.unshift({ ...t, status: 'Failed', reason }); commit() }
      throw new Error(reason)
    }
    apply(from, to, amt)
    db.txs.unshift({ ...t, status: 'Completed', reason: '' })
    commit()
    return db.txs[0]
  })
}

export function retryTx(id) {
  return locked(async () => {
    await sleep(500)
    const t = db.txs.find((x) => x.id === id)
    const from = db.users.find((u) => u.id === t.fromId)
    const to = db.users.find((u) => u.id === t.toId)
    const reason = validate(from, to, t.amount, id)
    if (reason) { t.reason = reason; commit(); throw new Error(reason) }
    apply(from, to, t.amount)
    t.status = 'Completed'; t.reason = ''; t.date = new Date().toISOString()
    commit()
  })
}

export function setStatus(userId, status) {
  db.users.find((u) => u.id === userId).status = status
  commit()
}

export function updateProfile(id, patch) {
  Object.assign(db.users.find((u) => u.id === id), patch)
  commit()
}
