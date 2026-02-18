import { supabase } from './supabase'
import type { Media } from '../features/watchlist/watchlistService'

export async function getMediaByTmdbId(
  tmdbId: number,
  mediaType: 'movie' | 'tv'
): Promise<Media | null> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching media by TMDB ID:', error)
    throw error
  }

  return data as Media
}

export async function createMedia(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  title: string,
  releaseYear: string | null,
  description: string | null,
  posterPath: string | null
): Promise<Media> {
  const { data, error } = await supabase
    .from('media')
    .insert({
      tmdb_id: tmdbId,
      media_type: mediaType,
      title,
      release_year: releaseYear,
      description,
      poster_path: posterPath,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating media:', error)
    throw error
  }

  return data as Media
}

export async function getOrCreateMedia(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  title: string,
  releaseYear: string | null,
  description: string | null,
  posterPath: string | null
): Promise<Media> {
  // First, try to find the media by TMDB ID and type
  const existingMedia = await getMediaByTmdbId(tmdbId, mediaType)

  if (existingMedia) {
    return existingMedia
  }

  // If it doesn't exist, create it
  return await createMedia(tmdbId, mediaType, title, releaseYear, description, posterPath)
}
