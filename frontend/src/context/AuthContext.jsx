import { createContext, useContext, useState } from 'react'
import * as api from '../api/store.js'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(api.sessionUser())
  const value = {
    user,
    async login(email, pw, role) { const u = await api.login(email, pw, role); setUser(u); return u },
    logout() { api.logout(); setUser(null) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
