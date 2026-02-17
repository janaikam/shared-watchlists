import React, { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut as firebaseSignOut,
	onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../../services/firebase'
import { AuthContext } from './AuthContext.tsx'
import { ensureUserExists } from '../../services/supabase'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (u) => {
			setUser(u)
			setLoading(false)

			if (u) {
				ensureUserExists(u.uid, u.email).catch((err) => {
					console.error('Failed to sync user to Supabase:', err)
				})
			}
		})
		return () => unsubscribe()
	}, [])

	const signUp = async (email: string, password: string) => {
		await createUserWithEmailAndPassword(auth, email, password)
	}

	const signIn = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password)
	}

	const signInWithGoogle = async () => {
		await signInWithPopup(auth, googleProvider)
	}

	const signOut = async () => {
		await firebaseSignOut(auth)
	}

	return (
		<AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
