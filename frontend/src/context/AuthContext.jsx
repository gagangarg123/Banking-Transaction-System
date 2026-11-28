import { createContext, useContext, useState } from 'react'
import { login as apiLogin, logoutApi,savedUser } from '../api/client.js'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedUser)
  const value = {
    user,
    async login(email, pw,role) {
      const u = await apiLogin(email, pw,role)
      setUser(u)
      return u
    },
    logout() { logoutApi(); setUser(null) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
