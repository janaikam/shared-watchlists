import { useState, useEffect, useRef } from 'react'
import { searchMedia, searchMulti, getPosterUrl, getYear, getTitle, getReleaseDate, type TMDBMovie } from '../../services/tmdbService'

interface MovieSearchInputProps {
  onSelect: (movie: TMDBMovie) => void
  placeholder?: string
  mediaType?: 'movie' | 'tv'
}

export default function MovieSearchInput({ onSelect, placeholder = 'Search for a movie or TV show...', mediaType }: MovieSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true)
        const results = mediaType
          ? await searchMedia(query, mediaType)
          : await searchMulti(query)
        setResults(results)
        setLoading(false)
        setShowDropdown(true)
      } else {
        setResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(searchDebounce)
  }, [query, mediaType])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (movie: TMDBMovie) => {
    onSelect(movie)
    setQuery('')
    setResults([])
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 200 }} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ width: '100%', padding: 8, fontSize: 14 }}
      />

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: 400,
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          {loading ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
              No movies found
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                  cursor: 'pointer',
                  backgroundColor: selectedIndex === index ? '#f0f0f0' : 'white',
                  borderBottom: '1px solid #eee',
                }}
              >
                <img
                  src={getPosterUrl(item.poster_path, 'w185')}
                  alt={getTitle(item)}
                  style={{
                    width: 50,
                    height: 75,
                    objectFit: 'cover',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                    {getTitle(item)}
                    {item.media_type && (
                      <span style={{
                        marginLeft: 8,
                        fontSize: 11,
                        padding: '2px 6px',
                        backgroundColor: item.media_type === 'movie' ? '#e3f2fd' : '#f3e5f5',
                        color: item.media_type === 'movie' ? '#1976d2' : '#7b1fa2',
                        borderRadius: 4,
                        fontWeight: 'normal'
                      }}>
                        {item.media_type === 'movie' ? 'Movie' : 'TV'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {getYear(getReleaseDate(item)) || 'N/A'}
                  </div>
                  {item.overview && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#999',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.overview}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
