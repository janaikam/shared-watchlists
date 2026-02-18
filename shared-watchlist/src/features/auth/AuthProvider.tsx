import React, { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../../services/firebase'
import { AuthContext } from './AuthContext.tsx'
import { ensureUserExists, getEmailByUsername } from '../../services/supabase'

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

	const signUp = async (email: string, password: string, username: string) => {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		// Immediately create the Supabase user record with username
		await ensureUserExists(userCredential.user.uid, email, username)
	}

	const signIn = async (emailOrUsername: string, password: string) => {
		// Check if input looks like an email (contains @)
		let email = emailOrUsername
		if (!emailOrUsername.includes('@')) {
			// It's a username, look up the email
			const foundEmail = await getEmailByUsername(emailOrUsername)
			if (!foundEmail) {
				throw new Error('Username not found')
			}
			email = foundEmail
		}
		await signInWithEmailAndPassword(auth, email, password)
	}

	const signOut = async () => {
		await firebaseSignOut(auth)
	}

	return (
		<AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthProvider
