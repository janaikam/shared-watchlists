import { useState } from 'react'
import useAuth from './useAuth'

export default function LoginPage() {
	const { signIn, signUp } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isSigningUp, setIsSigningUp] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			if (isSigningUp) {
				if (!username.trim()) {
					setError('Username is required')
					return
				}
				await signUp(email, password, username.trim())
			} else {
				await signIn(email, password)
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Authentication error')
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto', padding: 20 }}>
			<h2>{isSigningUp ? 'Create account' : 'Sign in'}</h2>
			<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
				{isSigningUp && (
					<input
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						type="text"
						required
					/>
				)}
				<input
					placeholder={isSigningUp ? "Email" : "Email or Username"}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type={isSigningUp ? "email" : "text"}
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
				<button onClick={() => setIsSigningUp((s) => !s)}>
					{isSigningUp ? 'Have an account? Sign in' : "Don't have an account? Sign up"}
				</button>
			</div>

			{error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
		</div>
	)
}
