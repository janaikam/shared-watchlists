import { useEffect, useState } from 'react'
import useAuth from '../auth/useAuth'
import { getGroupsForUser, createGroup, joinGroup } from './GroupService'
import WatchlistPage from '../watchlist/WatchlistPage'

interface Group {
  id: string
  name: string
}

export default function GroupListPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  useEffect(() => {
    if (!user) return
    getGroupsForUser(user.uid)
      .then((g) => setGroups(g))
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false))
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!newName) return setError('Group name required')
    try {
      const g = await createGroup(newName, user!.uid)
      setGroups((s) => [g, ...s])
      setNewName('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!joinId) return setError('Group id required')
    try {
      await joinGroup(joinId, user!.uid)
      // refresh
      const g = await getGroupsForUser(user!.uid)
      setGroups(g)
      setJoinId('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Groups</h2>
      {selectedGroup ? (
        <WatchlistPage
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onBack={() => setSelectedGroup(null)}
        />
      ) : loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedGroup(g)}>
              <strong>{g.name}</strong> <small>({g.id})</small>
            </li>
          ))}
          {groups.length === 0 && <li>No groups yet</li>}
        </ul>
      )}

      {!selectedGroup && (
        <>
          <div style={{ marginTop: 20 }}>
            <h3>Create Group</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8 }}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Group name" />
              <button type="submit">Create</button>
            </form>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>Join Group</h3>
            <form onSubmit={handleJoin} style={{ display: 'flex', gap: 8 }}>
              <input value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Group id" />
              <button type="submit">Join</button>
            </form>
          </div>

          {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </>
      )}
    </div>
  )
}
