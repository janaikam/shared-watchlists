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

interface WatchlistPageProps {
  groupId: string
  groupName: string
  onBack: () => void
}

export default function WatchlistPage({ groupId, groupName, onBack }: WatchlistPageProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchItems()
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
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleToggleStatus = async (item: WatchlistItem) => {
    try {
      setError(null)
      const newStatus = item.status === 'watched' ? 'not_watched' : 'watched'
      await updateWatchlistStatus(item.id, newStatus)
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      setError(null)
      await deleteWatchlistItem(itemId)
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}>← Back to Groups</button>
        <h2 style={{ margin: 0 }}>{groupName} - Watchlist</h2>
      </div>

      <div style={{ marginBottom: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Add Item</h3>
        <MovieSearchInput
          onSelect={handleMediaSelect}
          placeholder="Search for a movie or TV show..."
        />
      </div>

      {error && (
        <p style={{ color: 'crimson', padding: 8, background: '#ffe0e0', borderRadius: 4 }}>
          {error}
        </p>
      )}

      {loading ? (
        <div>Loading watchlist...</div>
      ) : (
        <div>
          <h3>Items ({items.length})</h3>
          {items.length === 0 ? (
            <p style={{ color: '#666' }}>No items in the watchlist yet. Add some above!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    backgroundColor: item.status === 'watched' ? '#f0f8f0' : '#fff',
                  }}
                >
                  {item.media?.poster_path && (
                    <img
                      src={getPosterUrl(item.media.poster_path, 'w185')}
                      alt={item.media.title}
                      style={{
                        width: 80,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        textDecoration: item.status === 'watched' ? 'line-through' : 'none',
                      }}
                    >
                      {item.media?.title}
                      {item.media?.release_year && (
                        <span style={{ fontWeight: 'normal', color: '#666', marginLeft: 8 }}>
                          ({item.media.release_year})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                      Type: {item.media?.media_type === 'movie' ? 'Movie' : 'TV Show'} | Status:{' '}
                      <span
                        style={{
                          color: item.status === 'watched' ? 'green' : 'orange',
                          fontWeight: 'bold',
                        }}
                      >
                        {item.status === 'watched' ? 'Watched' : 'Not Watched'}
                      </span>
                    </div>
                    {item.media?.description && (
                      <div
                        style={{
                          fontSize: 13,
                          color: '#777',
                          marginTop: 6,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.media.description}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      Added: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: item.status === 'watched' ? '#ff9800' : '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.status === 'watched' ? 'Mark Unwatched' : 'Mark Watched'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
