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

  return selectedGroup ? (
    <WatchlistPage
      groupId={selectedGroup.id}
      groupName={selectedGroup.name}
      onBack={() => setSelectedGroup(null)}
    />
  ) : (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h2>Your Groups</h2>
      </div>

      {/* Create and Join Forms */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Create Group</h5>
              <form onSubmit={handleCreate}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Group name"
                  />
                  <button className="btn btn-primary" type="submit">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Join Group</h5>
              <form onSubmit={handleJoin}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="Group code"
                  />
                  <button className="btn btn-success" type="submit">
                    Join
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Groups Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Groups ({groups.length})</h4>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-muted text-center py-4">No groups yet. Create or join one above!</p>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="table table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Group Name</th>
                    <th>Group Code</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      style={{ cursor: 'pointer' }}
                      className="align-middle"
                    >
                      <td>
                        <strong>{g.name}</strong>
                      </td>
                      <td>
                        <code className="text-muted small">{g.id}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
