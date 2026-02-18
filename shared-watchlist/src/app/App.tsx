import { useEffect, useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../styles/App.css'
import LoginPage from '../features/auth/LoginPage'
import useAuth from '../features/auth/useAuth'
import GroupListPage from '../features/groups/GroupListPage'
import { getUsernameByFirebaseUid } from '../services/supabase'

function App() {
  const { user, loading, signOut } = useAuth()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getUsernameByFirebaseUid(user.uid).then((name) => {
        setUsername(name)
      })
    } else {
      setUsername(null)
    }
  }, [user])

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>

  if (!user) return <LoginPage />

  return (
    <div style={{ padding: 20 }}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <h1 style={{ margin: 0 }}>Welcome {username || user.email}</h1>
        <button onClick={() => signOut()}>Log out</button>
      </div>
      <p className="read-the-docs">You're signed in.</p>
      <main style={{ marginTop: 20 }}>
        <GroupListPage />
      </main>
    </div>
  )
}

export default App
