# Banking System – Transaction System UI

React + Vite front end with login, customer portal and admin portal.

## Run
    npm install
    npm run dev

## Demo logins
| Role     | Email               | Password |
|----------|---------------------|----------|
| Admin    | admin@bankingsystem.com | admin123 |
| Customer | rohan@example.com   | demo123  | (account 501003983302)
| Customer | anita@example.com   | demo123  | (account 501003778814)

Customers cannot sign up. Log in as admin, open Customers, and use Add customer. It creates the account number and a temporary password to give to the customer. Then log in as that customer and transfer to the accounts above.

## Backend
`src/api/store.js` is a localStorage mock so the UI works on its own. Every exported function
(`login`, `addCustomer`, `transfer`, `retryTx`, `setStatus`) maps to one REST call in your Java backend.
Replace the function bodies with `fetch()` calls; the pages do not need to change.
Passwords are stored in plain text here for demo purposes only. Never do this in production.
