// Demo backend: lets the whole UI run with no server.
// It is used when DEMO_MODE = true in client.js. Data is kept in the browser (localStorage).
// const KEY = 'nb_demo_v1'
// const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// let counter = 0
// const tid = () => 'TXN-' + Date.now() + '-' + String(++counter).padStart(3, '0')
// const ago = (days, hour = 11) => {
//   const d = new Date()
//   d.setDate(d.getDate() - days)
//   d.setHours(hour, 10 + counter, 0, 0)
//   return d.toISOString()
// }

// const ROHAN = '501003983302'
// const ANITA = '501003778814'
// const KAPOOR = '501003772095'

// function seed() {
//   const acct = (no, cid, name, balance, status = 'ACTIVE') => ({
//     accountNumber: no, customerId: cid, customerName: name, accountType: 'SAVINGS', balance, status,
//     dailyTransferLimit: 200000, dailyWithdrawalLimit: 50000, createdAt: ago(600),
//   })
//   const tx = (days, type, from, to, amount, status = 'SUCCESS', message = 'Transaction successful') =>
//     ({ transactionId: tid(), timestamp: ago(days, 9 + (counter % 8)), type, sourceAccount: from, destinationAccount: to, amount, status, message })
//   return {
//     users: [
//       { email: 'admin@bankingsystem.com', password: 'admin123', role: 'ADMIN', name: 'Ravi Kumar', customerId: null },
//       { email: 'rohan@example.com', password: 'demo123', role: 'CUSTOMER', name: 'Rohan Mehta', customerId: 1 },
//       { email: 'anita@example.com', password: 'demo123', role: 'CUSTOMER', name: 'Anita Verma', customerId: 2 },
//     ],
//     customers: [
//       { id: 1, name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9812340021' },
//       { id: 2, name: 'Anita Verma', email: 'anita@example.com', phone: '9701188342' },
//       { id: 3, name: 'S. Kapoor', email: 'kapoor@example.com', phone: '9988710456' },
//     ],
//     accounts: [acct(ROHAN, 1, 'Rohan Mehta', 57400), acct(ANITA, 2, 'Anita Verma', 132000), acct(KAPOOR, 3, 'S. Kapoor', 412900, 'FROZEN')],
//     transactions: [
//       tx(6, 'DEPOSIT', null, ROHAN, 20000),
//       tx(5, 'TRANSFER', ANITA, ROHAN, 8000),
//       tx(5, 'TRANSFER', KAPOOR, ANITA, 12000),
//       tx(4, 'WITHDRAWAL', ROHAN, null, 3000),
//       tx(3, 'TRANSFER', ROHAN, ANITA, 5000),
//       tx(3, 'TRANSFER', ROHAN, KAPOOR, 30000, 'FAILED', 'Destination account is frozen'),
//       tx(2, 'TRANSFER', ANITA, ROHAN, 25000),
//       tx(2, 'WITHDRAWAL', ANITA, null, 60000, 'FAILED', 'Daily withdrawal limit exceeded'),
//       tx(1, 'TRANSFER', ROHAN, ANITA, 12500),
//       tx(1, 'TRANSFER', ROHAN, ANITA, 90000, 'FAILED', 'Insufficient balance'),
//       tx(0, 'DEPOSIT', null, ROHAN, 4000),
//     ],
//   }
// }

// const save = (db) => localStorage.setItem(KEY, JSON.stringify(db))
// function load() {
//   try {
//     const d = JSON.parse(localStorage.getItem(KEY))
//     if (d && d.users) return d
//   } catch { /* fall through and reseed */ }
//   const d = seed()
//   save(d)
//   return d
// }
// export const resetDemo = () => localStorage.removeItem(KEY)

// const newAccNo = (db) => {
//   let n
//   do { n = '5010' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0') } while (db.accounts.some((a) => a.accountNumber === n))
//   return n
// }
// const newAccount = (db, customerId, name, balance) => ({
//   accountNumber: newAccNo(db), customerId, customerName: name, accountType: 'SAVINGS', balance: Number(balance) || 0,
//   status: 'ACTIVE', dailyTransferLimit: 200000, dailyWithdrawalLimit: 50000, createdAt: new Date().toISOString(),
// })

// const sameDay = (iso) => new Date(iso).toDateString() === new Date().toDateString()
// const todayOut = (db, acc, type) =>
//   db.transactions
//     .filter((t) => t.type === type && t.status === 'SUCCESS' && t.sourceAccount === acc.accountNumber && sameDay(t.timestamp))
//     .reduce((s, t) => s + t.amount, 0)

// function runTransaction(db, type, b) {
//   const amt = Number(b.amount)
//   const base = {
//     transactionId: b.transactionId || tid(), timestamp: new Date().toISOString(), type,
//     sourceAccount: b.sourceAccount || null, destinationAccount: b.destinationAccount || null, amount: amt,
//   }
//   const record = (status, message) => { const t = { ...base, status, message }; db.transactions.push(t); return t }
//   const src = db.accounts.find((a) => a.accountNumber === b.sourceAccount)
//   const dst = db.accounts.find((a) => a.accountNumber === b.destinationAccount)

//   if (!(amt > 0)) return record('REJECTED', 'Amount must be greater than zero')
//   if (type !== 'DEPOSIT' && !src) return record('FAILED', 'Source account not found')
//   if (type !== 'WITHDRAWAL' && !dst) return record('FAILED', 'Destination account not found')
//   if (src && src.status !== 'ACTIVE') return record('FAILED', 'Source account is frozen')
//   if (dst && dst.status !== 'ACTIVE') return record('FAILED', 'Destination account is frozen')
//   if (type === 'TRANSFER' && src === dst) return record('REJECTED', 'Cannot transfer to the same account')
//   if (src && src.balance < amt) return record('FAILED', 'Insufficient balance')
//   if (type === 'WITHDRAWAL' && todayOut(db, src, type) + amt > src.dailyWithdrawalLimit) return record('FAILED', 'Daily withdrawal limit exceeded')
//   if (type === 'TRANSFER' && todayOut(db, src, type) + amt > src.dailyTransferLimit) return record('FAILED', 'Daily transfer limit exceeded')

//   if (src) src.balance -= amt
//   if (dst) dst.balance += amt
//   return record('SUCCESS', 'Transaction successful')
// }

// const TYPES = { transfer: 'TRANSFER', deposit: 'DEPOSIT', withdraw: 'WITHDRAWAL' }

// export async function demoLogin(email, password) {
//   await sleep(400)
//   const u = load().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
//   if (!u) throw new Error('Email or password is incorrect.')
//   return { token: 'demo-token', email: u.email, name: u.name, role: u.role, customerId: u.customerId }
// }

// // Same paths and response shapes as the Java backend
// export async function demoApi(path, options = {}) {
//   await sleep(250)
//   const method = (options.method || 'GET').toUpperCase()
//   const body = options.body ? JSON.parse(options.body) : {}
//   const [res, a, b] = path.split('?')[0].split('/').filter(Boolean).slice(1)
//   const db = load()
//   const done = (v) => { save(db); return v }

//   if (res === 'customers') {
//     if (method === 'POST' && a === 'onboard') {
//       if (db.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase())) throw new Error('A customer with this email already exists.')
//       const id = Math.max(0, ...db.customers.map((c) => c.id)) + 1
//       const acc = newAccount(db, id, body.name, body.deposit)
//       db.customers.push({ id, name: body.name, email: body.email, phone: body.phone })
//       db.users.push({ email: body.email, password: body.password, role: 'CUSTOMER', name: body.name, customerId: id })
//       db.accounts.push(acc)
//       return done({ name: body.name, email: body.email, accountNumber: acc.accountNumber })
//     }
//     if (method === 'POST') {
//       const id = Math.max(0, ...db.customers.map((c) => c.id)) + 1
//       const c = { id, name: body.name, email: body.email, phone: body.phone }
//       db.customers.push(c)
//       return done(c)
//     }
//     if (a) {
//       const c = db.customers.find((x) => String(x.id) === a)
//       if (!c) throw new Error('Customer not found')
//       return c
//     }
//     return db.customers
//   }

//   if (res === 'accounts') {
//     if (method === 'POST' && !a) {
//       const c = db.customers.find((x) => x.id === Number(body.customerId))
//       const acc = newAccount(db, Number(body.customerId), c ? c.name : 'Customer', body.balance)
//       db.accounts.push(acc)
//       return done(acc)
//     }
//     if (a) {
//       const acc = db.accounts.find((x) => x.accountNumber === a)
//       if (!acc) throw new Error('Account not found')
//       if (b === 'freeze' || b === 'unfreeze') { acc.status = b === 'freeze' ? 'FROZEN' : 'ACTIVE'; return done(acc) }
//       return acc
//     }
//     return db.accounts
//   }

//   if (res === 'transactions') {
//     if (method === 'POST') return done(runTransaction(db, TYPES[a], body))
//     const sorted = [...db.transactions].sort((x, y) => y.timestamp.localeCompare(x.timestamp))
//     if (a === 'account') return sorted.filter((t) => t.sourceAccount === b || t.destinationAccount === b)
//     return sorted
//   }

//   if (res === 'reports') {
//     if (a === 'daily-summary') {
//       const t = db.transactions.filter((x) => sameDay(x.timestamp))
//       const count = (s) => t.filter((x) => x.status === s).length
//       return {
//         totalTransactions: t.length, successCount: count('SUCCESS'), failedCount: count('FAILED'), rejectedCount: count('REJECTED'),
//         totalAmount: t.filter((x) => x.status === 'SUCCESS').reduce((s, x) => s + x.amount, 0),
//       }
//     }
//     if (a === 'top-accounts') {
//       const n = {}
//       db.transactions.forEach((t) => [t.sourceAccount, t.destinationAccount].forEach((k) => { if (k) n[k] = (n[k] || 0) + 1 }))
//       return Object.entries(n).sort((x, y) => y[1] - x[1]).slice(0, 10).map(([accountNumber, transactionCount]) => ({ accountNumber, transactionCount }))
//     }
//   }

//   throw new Error('Not found: ' + path)
// }






// Demo backend: lets the whole UI run with no server.
// It is used when DEMO_MODE = true in client.js. Data is kept in the browser (localStorage).
const KEY = 'nb_demo_v1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let counter = 0
const tid = () => 'TXN-' + Date.now() + '-' + String(++counter).padStart(3, '0')
const ago = (days, hour = 11) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, 10 + counter, 0, 0)
  return d.toISOString()
}

const ROHAN = '501003983302'
const ANITA = '501003778814'
const KAPOOR = '501003772095'

function seed() {
  const acct = (no, cid, name, balance, status = 'ACTIVE') => ({
    accountNumber: no, customerId: cid, customerName: name, accountType: 'SAVINGS', balance, status,
    dailyTransferLimit: 200000, dailyWithdrawalLimit: 50000, createdAt: ago(600),
  })
  const tx = (days, type, from, to, amount, status = 'SUCCESS', message = 'Transaction successful') =>
    ({ transactionId: tid(), timestamp: ago(days, 9 + (counter % 8)), type, sourceAccount: from, destinationAccount: to, amount, status, message })
  return {
    users: [
      { email: 'admin@bankingsystem.com', password: 'admin123', role: 'ADMIN', name: 'Ravi Kumar', customerId: null },
      { email: 'rohan@example.com', password: 'demo123', role: 'CUSTOMER', name: 'Rohan Mehta', customerId: 1 },
      { email: 'anita@example.com', password: 'demo123', role: 'CUSTOMER', name: 'Anita Verma', customerId: 2 },
    ],
    customers: [
      { id: 1, name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9812340021' },
      { id: 2, name: 'Anita Verma', email: 'anita@example.com', phone: '9701188342' },
      { id: 3, name: 'S. Kapoor', email: 'kapoor@example.com', phone: '9988710456' },
    ],
    accounts: [acct(ROHAN, 1, 'Rohan Mehta', 57400), acct(ANITA, 2, 'Anita Verma', 132000), acct(KAPOOR, 3, 'S. Kapoor', 412900, 'FROZEN')],
    transactions: [
      tx(6, 'DEPOSIT', null, ROHAN, 20000),
      tx(5, 'TRANSFER', ANITA, ROHAN, 8000),
      tx(5, 'TRANSFER', KAPOOR, ANITA, 12000),
      tx(4, 'WITHDRAWAL', ROHAN, null, 3000),
      tx(3, 'TRANSFER', ROHAN, ANITA, 5000),
      tx(3, 'TRANSFER', ROHAN, KAPOOR, 30000, 'FAILED', 'Destination account is frozen'),
      tx(2, 'TRANSFER', ANITA, ROHAN, 25000),
      tx(2, 'WITHDRAWAL', ANITA, null, 60000, 'FAILED', 'Daily withdrawal limit exceeded'),
      tx(1, 'TRANSFER', ROHAN, ANITA, 12500),
      tx(1, 'TRANSFER', ROHAN, ANITA, 90000, 'FAILED', 'Insufficient balance'),
      tx(0, 'DEPOSIT', null, ROHAN, 4000),
    ],
  }
}

const save = (db) => localStorage.setItem(KEY, JSON.stringify(db))
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY))
    if (d && d.users) return d
  } catch { /* fall through and reseed */ }
  const d = seed()
  save(d)
  return d
}
export const resetDemo = () => localStorage.removeItem(KEY)

const newAccNo = (db) => {
  let n
  do { n = '5010' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0') } while (db.accounts.some((a) => a.accountNumber === n))
  return n
}
const newAccount = (db, customerId, name, balance) => ({
  accountNumber: newAccNo(db), customerId, customerName: name, accountType: 'SAVINGS', balance: Number(balance) || 0,
  status: 'ACTIVE', dailyTransferLimit: 200000, dailyWithdrawalLimit: 50000, createdAt: new Date().toISOString(),
})

const pad2 = (n) => String(n).padStart(2, '0')
const ymd = (iso) => { const x = new Date(iso); return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}` }
const reasonCode = (m = '') =>
  /insufficient/i.test(m) ? 'INSUFFICIENT_BALANCE'
  : /frozen/i.test(m) ? 'ACCOUNT_FROZEN'
  : /limit/i.test(m) ? 'DAILY_LIMIT_EXCEEDED'
  : /not found/i.test(m) ? 'ACCOUNT_NOT_FOUND'
  : /greater than zero/i.test(m) ? 'INVALID_AMOUNT'
  : /same account/i.test(m) ? 'SAME_ACCOUNT' : 'OTHER'
const sameDay = (iso) => new Date(iso).toDateString() === new Date().toDateString()
const todayOut = (db, acc, type) =>
  db.transactions
    .filter((t) => t.type === type && t.status === 'SUCCESS' && t.sourceAccount === acc.accountNumber && sameDay(t.timestamp))
    .reduce((s, t) => s + t.amount, 0)

function runTransaction(db, type, b) {
  const amt = Number(b.amount)
  const base = {
    transactionId: b.transactionId || tid(), timestamp: new Date().toISOString(), type,
    sourceAccount: b.sourceAccount || null, destinationAccount: b.destinationAccount || null, amount: amt,
  }
  const record = (status, message) => { const t = { ...base, status, message }; db.transactions.push(t); return t }
  const src = db.accounts.find((a) => a.accountNumber === b.sourceAccount)
  const dst = db.accounts.find((a) => a.accountNumber === b.destinationAccount)

  if (!(amt > 0)) return record('REJECTED', 'Amount must be greater than zero')
  if (type !== 'DEPOSIT' && !src) return record('FAILED', 'Source account not found')
  if (type !== 'WITHDRAWAL' && !dst) return record('FAILED', 'Destination account not found')
  if (src && src.status !== 'ACTIVE') return record('FAILED', 'Source account is frozen')
  if (dst && dst.status !== 'ACTIVE') return record('FAILED', 'Destination account is frozen')
  if (type === 'TRANSFER' && src === dst) return record('REJECTED', 'Cannot transfer to the same account')
  if (src && src.balance < amt) return record('FAILED', 'Insufficient balance')
  if (type === 'WITHDRAWAL' && todayOut(db, src, type) + amt > src.dailyWithdrawalLimit) return record('FAILED', 'Daily withdrawal limit exceeded')
  if (type === 'TRANSFER' && todayOut(db, src, type) + amt > src.dailyTransferLimit) return record('FAILED', 'Daily transfer limit exceeded')

  if (src) src.balance -= amt
  if (dst) dst.balance += amt
  return record('SUCCESS', 'Transaction successful')
}

const TYPES = { transfer: 'TRANSFER', deposit: 'DEPOSIT', withdraw: 'WITHDRAWAL' }

export async function demoLogin(email, password) {
  await sleep(400)
  const u = load().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
  if (!u) throw new Error('Email or password is incorrect.')
  return { token: 'demo-token', email: u.email, name: u.name, role: u.role, customerId: u.customerId }
}

// Same paths and response shapes as the Java backend
export async function demoApi(path, options = {}) {
  await sleep(250)
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body ? JSON.parse(options.body) : {}
  const [res, a, b, c] = path.split('?')[0].split('/').filter(Boolean).slice(1)
  const db = load()
  const done = (v) => { save(db); return v }

  if (res === 'customers') {
    if (method === 'POST' && a === 'onboard') {
      if (db.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase())) throw new Error('A customer with this email already exists.')
      const id = Math.max(0, ...db.customers.map((c) => c.id)) + 1
      const acc = newAccount(db, id, body.name, body.deposit)
      db.customers.push({ id, name: body.name, email: body.email, phone: body.phone })
      db.users.push({ email: body.email, password: body.password, role: 'CUSTOMER', name: body.name, customerId: id })
      db.accounts.push(acc)
      return done({ name: body.name, email: body.email, accountNumber: acc.accountNumber })
    }
    if (method === 'POST') {
      const id = Math.max(0, ...db.customers.map((c) => c.id)) + 1
      const c = { id, name: body.name, email: body.email, phone: body.phone }
      db.customers.push(c)
      return done(c)
    }
    if (a) {
      const c = db.customers.find((x) => String(x.id) === a)
      if (!c) throw new Error('Customer not found')
      return c
    }
    return db.customers
  }

  if (res === 'accounts') {
    if (method === 'POST' && !a) {
      const c = db.customers.find((x) => x.id === Number(body.customerId))
      const acc = newAccount(db, Number(body.customerId), c ? c.name : 'Customer', body.balance)
      db.accounts.push(acc)
      return done(acc)
    }
    if (a) {
      const acc = db.accounts.find((x) => x.accountNumber === a)
      if (!acc) throw new Error('Account not found')
      if (b === 'freeze' || b === 'unfreeze') { acc.status = b === 'freeze' ? 'FROZEN' : 'ACTIVE'; return done(acc) }
      return acc
    }
    return db.accounts
  }

  if (res === 'transactions') {
    if (method === 'POST') return done(runTransaction(db, TYPES[a], body))
    const sorted = [...db.transactions].sort((x, y) => y.timestamp.localeCompare(x.timestamp))
    if (a === 'account') return sorted.filter((t) => t.sourceAccount === b || t.destinationAccount === b)
    return sorted
  }

  if (res === 'reports') {
    const q = new URLSearchParams(path.split('?')[1] || '')
    const okTx = db.transactions.filter((t) => t.status === 'SUCCESS')
    // rule: only completed transactions count; a transfer counts for both accounts
    const counts = () => {
      const n = {}
      okTx.forEach((t) => [t.sourceAccount, t.destinationAccount].forEach((k) => { if (k) n[k] = (n[k] || 0) + 1 }))
      return Object.entries(n).map(([accountNumber, transactionCount]) => ({ accountNumber, transactionCount }))
        .sort((x, y) => y.transactionCount - x.transactionCount)
    }

    if (a === 'daily-summary') {
      const t = db.transactions.filter((x) => sameDay(x.timestamp))
      const count = (s) => t.filter((x) => x.status === s).length
      return {
        totalTransactions: t.length, successCount: count('SUCCESS'), failedCount: count('FAILED'), rejectedCount: count('REJECTED'),
        totalAmount: t.filter((x) => x.status === 'SUCCESS').reduce((s, x) => s + x.amount, 0),
      }
    }

    if (a === 'top-accounts') return counts().slice(0, 10)

    if (a === 'failed-transactions') {
      const n = {}
      db.transactions.filter((t) => t.status !== 'SUCCESS').forEach((t) => { const r = reasonCode(t.message); n[r] = (n[r] || 0) + 1 })
      return Object.entries(n).map(([reason, count]) => ({ reason, count })).sort((x, y) => y.count - x.count)
    }

    if (a === 'daily-transaction-amounts') {
      const from = q.get('from'), to = q.get('to')
      if (!from || !to) throw new Error('Both from and to dates are required.')
      if (isNaN(Date.parse(from)) || isNaN(Date.parse(to))) throw new Error('Dates must be in YYYY-MM-DD format.')
      if (from > to) throw new Error('From date must be on or before the To date.')
      if ((Date.parse(to) - Date.parse(from)) / 864e5 > 366) throw new Error('Date range cannot be more than 366 days.')
      const sums = {}
      okTx.forEach((t) => { const day = ymd(t.timestamp); if (day >= from && day <= to) { const k = day + '|' + t.type; sums[k] = (sums[k] || 0) + t.amount } })
      const order = { DEPOSIT: 0, WITHDRAWAL: 1, TRANSFER: 2 }
      return Object.entries(sums)
        .map(([k, totalAmount]) => { const [date, type] = k.split('|'); return { date, type, totalAmount } })
        .sort((x, y) => x.date.localeCompare(y.date) || order[x.type] - order[y.type])
    }

    if (a === 'accounts-above-transaction-count') {
      const raw = q.get('threshold')
      const th = Number(raw)
      if (raw === null || raw === '' || !Number.isInteger(th) || th < 0 || th > 1000000) throw new Error('Threshold must be a whole number between 0 and 1,000,000.')
      return counts().filter((x) => x.transactionCount > th)
    }

    if (a === 'customer' && c === 'transactions') {
      const cust = db.customers.find((x) => String(x.id) === b)
      if (!cust) throw new Error('Customer not found')
      const page = Number(q.get('page') ?? 0), size = Number(q.get('size') ?? 20)
      if (!Number.isInteger(page) || page < 0) throw new Error('Page must be 0 or more.')
      if (!Number.isInteger(size) || size < 1 || size > 100) throw new Error('Page size must be between 1 and 100.')
      const from = q.get('from'), to = q.get('to')
      if (from && to && from > to) throw new Error('From date must be on or before the To date.')
      const mine = db.accounts.filter((x) => x.customerId === cust.id).map((x) => x.accountNumber)
      return db.transactions
        .filter((t) => mine.includes(t.sourceAccount) || mine.includes(t.destinationAccount))
        .filter((t) => (!from || ymd(t.timestamp) >= from) && (!to || ymd(t.timestamp) <= to))
        .sort((x, y) => y.timestamp.localeCompare(x.timestamp))
        .slice(page * size, page * size + size)
        .map(({ transactionId, type, amount, status, timestamp }) => ({ transactionId, type, amount, status, timestamp }))
    }
  }

  throw new Error('Not found: ' + path)
}
