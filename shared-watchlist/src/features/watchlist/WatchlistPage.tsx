import { useEffect, useState } from 'react'
import useAuth from '../auth/useAuth'
import {
  getWatchlistItems,
  addWatchlistItem,
  updateWatchlistStatus,
  deleteWatchlistItem,
  type WatchlistItem,
} from './watchlistService'
import { ensureUserExists } from '../../services/supabase'
import MovieSearchInput from './MovieSearchInput'
import { getPosterUrl, getYear, getTitle, getReleaseDate, type TMDBMovie } from '../../services/tmdbService'
import { getGroupMembers } from '../groups/GroupService'

interface GroupMember {
  user_id: string
  user?: { id: string; firebase_uid: string; email: string; username?: string; created_at: string }
  role: 'admin' | 'member'
  joined_at?: string
}

interface WatchlistPageProps {
  groupId: string
  groupName: string
  onBack: () => void
}

export default function WatchlistPage({ groupId, groupName, onBack }: WatchlistPageProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGroupCode, setShowGroupCode] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getWatchlistItems(groupId)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Refresh items without showing loading spinner (for mutations)
  const refreshItems = async () => {
    try {
      setError(null)
      const data = await getWatchlistItems(groupId)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const fetchMembers = async () => {
    try {
      const data = await getGroupMembers(groupId)
      setMembers(data.map((member) => ({
        ...member,
        role: member.role as 'admin' | 'member',
      })))
    } catch (err) {
      console.error('Error fetching members:', err)
    }
  }

  useEffect(() => {
    fetchItems()
    fetchMembers()
  }, [groupId])

  const handleMediaSelect = async (media: TMDBMovie) => {
    try {
      setError(null)

      if (!media.media_type) {
        setError('Unable to determine media type')
        return
      }

      const supabaseUser = await ensureUserExists(user!.uid)
      if (!supabaseUser?.id) {
        throw new Error('User not found')
      }

      await addWatchlistItem(
        groupId,
        getTitle(media),
        media.media_type,
        supabaseUser.id,
        media.id,
        media.poster_path,
        getYear(getReleaseDate(media)),
        media.overview || null
      )
      await refreshItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleToggleStatus = async (item: WatchlistItem) => {
    try {
      setError(null)
      const newStatus = item.status === 'watched' ? 'not_watched' : 'watched'
      await updateWatchlistStatus(item.id, newStatus)
      await refreshItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      setError(null)
      await deleteWatchlistItem(itemId)
      await refreshItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={onBack}>
          ← Back to Groups
        </button>

        <div className="d-flex align-items-center gap-3 mb-3">
          <h2 className="mb-0">{groupName}</h2>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => setShowGroupCode(!showGroupCode)}
          >
            {showGroupCode ? 'Hide Code' : 'Show Code'}
          </button>
        </div>

        {showGroupCode && (
          <div className="alert alert-info d-flex align-items-center gap-2">
            <strong>Group Code:</strong>
            <code className="bg-white px-2 py-1 rounded">{groupId}</code>
            <button
              className="btn btn-sm btn-secondary ms-auto"
              onClick={() => {
                navigator.clipboard.writeText(groupId)
                alert('Group code copied to clipboard!')
              }}
            >
              Copy
            </button>
          </div>
        )}

        {/* Members Section */}
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-subtitle mb-3 text-muted">Group Members ({members.length})</h6>
            <div className="d-flex flex-wrap gap-2">
              {members.map((member) => (
                <span
                  key={member.user_id}
                  className={`badge ${member.role === 'admin' ? 'bg-primary' : 'bg-secondary'} fs-6`}
                  title={member.user?.username || member.user_id}
                >
                  {member.user?.username || member.user_id}
                  {member.role === 'admin' && ' ★'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Add Item</h5>
          <MovieSearchInput
            onSelect={handleMediaSelect}
            placeholder="Search for a movie or TV show..."
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Watchlist Items */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Watchlist ({items.length})</h4>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <p className="text-muted text-center py-4">No items in the watchlist yet. Add some above!</p>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <div className="p-3">
                <div className="row g-3">
                  {items.map((item) => (
                    <div key={item.id} className="col-12">
                      <div className={`card ${item.status === 'watched' ? 'bg-light' : ''}`}>
                        <div className="card-body">
                          <div className="row align-items-center">
                            {/* Poster */}
                            {item.media?.poster_path && (
                              <div className="col-auto">
                                <img
                                  src={getPosterUrl(item.media.poster_path, 'w185')}
                                  alt={item.media.title}
                                  className="rounded"
                                  style={{ width: 80, height: 120, objectFit: 'cover' }}
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="col">
                              <h5 className={`card-title mb-2 ${item.status === 'watched' ? 'text-decoration-line-through' : ''}`}>
                                {item.media?.title}
                                {item.media?.release_year && (
                                  <span className="text-muted fw-normal ms-2">
                                    ({item.media.release_year})
                                  </span>
                                )}
                              </h5>

                              <div className="mb-2">
                                <span className={`badge ${item.media?.media_type === 'movie' ? 'bg-info' : 'bg-purple'} me-2`}>
                                  {item.media?.media_type === 'movie' ? 'Movie' : 'TV Show'}
                                </span>
                                <span className={`badge ${item.status === 'watched' ? 'bg-success' : 'bg-warning'} me-2`}>
                                  {item.status === 'watched' ? 'Watched' : 'Not Watched'}
                                </span>
                                {item.request > 0 && (
                                  <span className="badge bg-primary">
                                    +{item.request} {item.request === 1 ? 'request' : 'requests'}
                                  </span>
                                )}
                              </div>

                              {item.media?.description && (
                                <p className="card-text text-muted small mb-2"
                                   style={{
                                     overflow: 'hidden',
                                     textOverflow: 'ellipsis',
                                     display: '-webkit-box',
                                     WebkitLineClamp: 2,
                                     WebkitBoxOrient: 'vertical',
                                   }}>
                                  {item.media.description}
                                </p>
                              )}

                              <small className="text-muted">
                                Added: {new Date(item.created_at).toLocaleDateString()}
                              </small>
                            </div>

                            {/* Actions */}
                            <div className="col-auto">
                              <div className="d-flex flex-column gap-2">
                                <button
                                  className={`btn btn-sm ${item.status === 'watched' ? 'btn-warning' : 'btn-success'}`}
                                  onClick={() => handleToggleStatus(item)}
                                >
                                  {item.status === 'watched' ? 'Mark Unwatched' : 'Mark Watched'}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
