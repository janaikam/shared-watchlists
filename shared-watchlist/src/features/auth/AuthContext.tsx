import { createContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextType {
    user: User | null
    loading: boolean
    signUp: (email: string, password: string, username: string) => Promise<void>
    signIn: (emailOrUsername: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)