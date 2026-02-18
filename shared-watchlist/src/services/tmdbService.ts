const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export interface TMDBMovie {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  poster_path: string | null
  overview: string
  vote_average: number
  media_type?: 'movie' | 'tv'
}

export interface TMDBSearchResult {
  results: TMDBMovie[]
  total_results: number
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  if (!query.trim() || !TMDB_API_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    const data: TMDBSearchResult = await response.json()
    const results = data.results.slice(0, 10).map(item => ({
      ...item,
      media_type: 'movie' as const
    }))
    return results
  } catch (error) {
    console.error('Error searching movies:', error)
    return []
  }
}

export async function searchTVShows(query: string): Promise<TMDBMovie[]> {
  if (!query.trim() || !TMDB_API_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    const data: TMDBSearchResult = await response.json()
    const results = data.results.slice(0, 10).map(item => ({
      ...item,
      media_type: 'tv' as const
    }))
    return results
  } catch (error) {
    console.error('Error searching TV shows:', error)
    return []
  }
}

export async function searchMedia(query: string, mediaType: 'movie' | 'tv'): Promise<TMDBMovie[]> {
  if (mediaType === 'tv') {
    return searchTVShows(query)
  }
  return searchMovies(query)
}

export async function searchMulti(query: string): Promise<TMDBMovie[]> {
  if (!query.trim() || !TMDB_API_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    const data: TMDBSearchResult = await response.json()
    // Filter to only include movies and TV shows (exclude people)
    const results = data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 10)
      .map(item => ({
        ...item,
        media_type: item.media_type as 'movie' | 'tv'
      }))
    return results
  } catch (error) {
    console.error('Error searching multi:', error)
    return []
  }
}

export function getPosterUrl(posterPath: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w185'): string {
  if (!posterPath) {
    return 'https://via.placeholder.com/185x278?text=No+Poster'
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`
}

export function getYear(releaseDate: string | undefined): string | null {
  if (!releaseDate) return null
  return new Date(releaseDate).getFullYear().toString()
}

export function getTitle(item: TMDBMovie): string {
  return item.title || item.name || 'Unknown'
}

export function getReleaseDate(item: TMDBMovie): string | undefined {
  return item.release_date || item.first_air_date
}
