import { useState } from 'react'
import useAuth from './useAuth'

export default function LoginPage() {
	const { signIn, signUp, signInWithGoogle } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isSigningUp, setIsSigningUp] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			if (isSigningUp) await signUp(email, password)
			else await signIn(email, password)
		} catch (err: any) {
			setError(err?.message || 'Authentication error')
		}
	}

	const handleGoogle = async () => {
		setError(null)
		try {
			await signInWithGoogle()
		} catch (err: any) {
			setError(err?.message || 'Google sign in failed')
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
			<h2>{isSigningUp ? 'Create account' : 'Sign in'}</h2>
			<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
				<input
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					required
				/>
				<input
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					required
				/>
				<button type="submit">{isSigningUp ? 'Create account' : 'Sign in'}</button>
			</form>

			<div style={{ marginTop: 12 }}>
				<button onClick={() => setIsSigningUp((s) => !s)} style={{ marginRight: 8 }}>
					{isSigningUp ? 'Have an account? Sign in' : "Don't have an account? Sign up"}
				</button>
				<button onClick={handleGoogle}>Sign in with Google</button>
			</div>

			{error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
		</div>
	)
}
