import { useEffect, useState } from 'react'
import '../styles/App.css'
import LoginPage from '../features/auth/LoginPage'
import useAuth from '../features/auth/useAuth'
import GroupListPage from '../features/groups/GroupListPage'
import { getUsernameByFirebaseUid } from '../services/supabase'

function App() {
  const { user, loading, signOut } = useAuth()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      return
    }

    // Fetch username immediately when user is available
    const fetchUsername = async () => {
      const name = await getUsernameByFirebaseUid(user.uid)
      setUsername(name)

      // If username is null, retry after a short delay
      // This handles race conditions during signup where the username
      // may not be in the database yet
      if (!name) {
        setTimeout(async () => {
          const retryName = await getUsernameByFirebaseUid(user.uid)
          if (retryName) {
            setUsername(retryName)
          }
        }, 500)
      }
    }

    fetchUsername()
  }, [user])

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>

  if (!user) return <LoginPage />

  return (
    <div>
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-light bg-light border-bottom">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Movie Watchlists</span>
          <button className="btn btn-outline-danger" onClick={() => signOut()}>
            Log out
          </button>
        </div>
      </nav>

      {/* Welcome Message */}
      <div className="bg-light">
        <div className="container-fluid text-center py-4">
          <h1>Welcome, {username || user.email}!</h1>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <GroupListPage />
      </main>
    </div>
  )
}

export default App
