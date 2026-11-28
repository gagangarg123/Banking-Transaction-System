// const API = "http://localhost:8080";
// const token = () => localStorage.getItem("nb_token");

// export async function api(path, options = {}) {
//   const res = await fetch(API + path, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
//     },
//     ...options,
//   });
//   if (!res.ok) {
//     let msg = `Request failed (${res.status})`;
//     try { msg = (await res.json()).message || msg; } catch {}
//     throw new Error(msg);
//   }
//   return res.json();
// }

// /* ---------- auth ---------- */
// export async function login(email, password, role) {
//   const res = await fetch(API + "/api/auth/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });
//   if (!res.ok) {
//     let msg = "Login failed";
//     try { msg = (await res.json()).message || msg; } catch {}
//     throw new Error(msg);
//   }
//   const data = await res.json();
//   const user = { id: data.email, email: data.email, name: data.name,
//                  role: data.role.toLowerCase(), customerId: data.customerId };
//   if (role && user.role !== role) {
//     throw new Error(user.role === "admin"
//       ? "This is an admin account. Use the Admin tab to sign in."
//       : "This is a customer account. Use the Customer tab to sign in.");
//   }
//   localStorage.setItem("nb_token", data.token);
//   localStorage.setItem("nb_user", JSON.stringify(user));
//   return user;
// }

// export const logoutApi = () => {
//   localStorage.removeItem("nb_token");
//   localStorage.removeItem("nb_user");
// };

// // keeps you signed in after a page refresh
// export const savedUser = () => {
//   try {
//     return localStorage.getItem("nb_token")
//       ? JSON.parse(localStorage.getItem("nb_user"))
//       : null;
//   } catch { return null; }
// };

// /* ---------- customers & accounts ---------- */
// export const getCustomers  = () => api("/api/customers");
// export const getAccounts   = () => api("/api/accounts");

// export const createCustomer = (body) =>
//   api("/api/customers", { method: "POST", body: JSON.stringify(body) });

// export const createAccount = (body) =>
//   api("/api/accounts", { method: "POST", body: JSON.stringify(body) });

// export const onboardCustomer = (body) =>
//   api("/api/customers/onboard", { method: "POST", body: JSON.stringify(body) });

// export const getAccount = (accNo) => api(`/api/accounts/${accNo}`);

// export const getAllTransactions = () => api("/api/transactions");

// export const getAccountTransactions = (accNo) =>
//   api(`/api/transactions/account/${accNo}`);

// export const getDailySummary = (date) =>
//   api(`/api/reports/daily-summary?date=${date}`);

// export const getTopAccounts = () => api("/api/reports/top-accounts");

// export const doTransfer = (body) =>
//   api("/api/transactions/transfer", { method: "POST", body: JSON.stringify(body) });

// export const doDeposit = (body) =>
//   api("/api/transactions/deposit", { method: "POST", body: JSON.stringify(body) });

// export const doWithdraw = (body) =>
//   api("/api/transactions/withdraw", { method: "POST", body: JSON.stringify(body) });

// export const freezeAccount   = (accNo) => api(`/api/accounts/${accNo}/freeze`,   { method: "POST" });
// export const unfreezeAccount = (accNo) => api(`/api/accounts/${accNo}/unfreeze`, { method: "POST" });






import { demoApi, demoLogin, resetDemo } from "./demo.js";

// false = talk to the Java backend at API below (your real backend)
// true  = no backend needed, the app uses built-in demo data (see demo.js)
export const DEMO_MODE = false;
export { resetDemo };

const API = "http://localhost:8080";
const token = () => localStorage.getItem("nb_token");

export async function api(path, options = {}) {
  if (DEMO_MODE) return demoApi(path, options);
  const res = await fetch(API + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) { logoutApi(); window.location.href = "/login"; }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/* ---------- auth ---------- */
export async function login(email, password, role) {
  let data;
  if (DEMO_MODE) {
    data = await demoLogin(email, password);
  } else {
    const res = await fetch(API + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let msg = "Login failed";
      try { msg = (await res.json()).message || msg; } catch {}
      throw new Error(msg);
    }
    data = await res.json();
  }
  const user = { id: data.email, email: data.email, name: data.name,
                 role: data.role.toLowerCase(), customerId: data.customerId };
  if (role && user.role !== role) {
    throw new Error(user.role === "admin"
      ? "This is an admin account. Use the Admin tab to sign in."
      : "This is a customer account. Use the Customer tab to sign in.");
  }
  localStorage.setItem("nb_token", data.token);
  localStorage.setItem("nb_user", JSON.stringify(user));
  return user;
}

export const logoutApi = () => {
  localStorage.removeItem("nb_token");
  localStorage.removeItem("nb_user");
};

// keeps you signed in after a page refresh
export const savedUser = () => {
  try { return localStorage.getItem("nb_token") ? JSON.parse(localStorage.getItem("nb_user")) : null; }
  catch { return null; }
};

/* ---------- customers & accounts ---------- */
export const getCustomers  = () => api("/api/customers");
export const getAccounts   = () => api("/api/accounts");

export const createCustomer = (body) =>
  api("/api/customers", { method: "POST", body: JSON.stringify(body) });

export const createAccount = (body) =>
  api("/api/accounts", { method: "POST", body: JSON.stringify(body) });

export const onboardCustomer = (body) =>
  api("/api/customers/onboard", { method: "POST", body: JSON.stringify(body) });

export const getAccount = (accNo) => api(`/api/accounts/${accNo}`);

export const getAllTransactions = () => api("/api/transactions");

export const getAccountTransactions = (accNo) =>
  api(`/api/transactions/account/${accNo}`);

export const getDailySummary = (date) =>
  api(`/api/reports/daily-summary?date=${date}`);

export const getTopAccounts = () => api("/api/reports/top-accounts");

export const getFailedByReason = () => api("/api/reports/failed-transactions");

export const getDailyAmounts = (from, to) =>
  api(`/api/reports/daily-transaction-amounts?from=${from}&to=${to}`);

export const getAccountsAbove = (threshold) =>
  api(`/api/reports/accounts-above-transaction-count?threshold=${threshold}`);

export const getCustomerHistory = (customerId, { page = 0, size = 10, from, to } = {}) => {
  const q = new URLSearchParams({ page, size });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  return api(`/api/reports/customer/${customerId}/transactions?${q}`);
};

export const doTransfer = (body) =>
  api("/api/transactions/transfer", { method: "POST", body: JSON.stringify(body) });

export const doDeposit = (body) =>
  api("/api/transactions/deposit", { method: "POST", body: JSON.stringify(body) });

export const doWithdraw = (body) =>
  api("/api/transactions/withdraw", { method: "POST", body: JSON.stringify(body) });

export const freezeAccount   = (accNo) => api(`/api/accounts/${accNo}/freeze`,   { method: "POST" });
export const unfreezeAccount = (accNo) => api(`/api/accounts/${accNo}/unfreeze`, { method: "POST" });
