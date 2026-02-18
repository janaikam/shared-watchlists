import { supabase } from '../../services/supabase'
import { getOrCreateMedia } from '../../services/mediaService'

export interface Media {
  id: string
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  release_year: string | null
  description: string | null
  poster_path: string | null
  created_at: string
  updated_at: string
}

export interface WatchlistItem {
  id: string
  group_id: string
  media_id: string
  added_by: string
  created_at: string
  status: 'watched' | 'not_watched'
  media?: Media
}

export async function getWatchlistItems(groupId: string) {
  const { data, error } = await supabase
    .from('watchlist_items')
    .select(`
      *,
      media:media(*)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching watchlist items:', error)
    throw error
  }

  return data as WatchlistItem[]
}

export async function addWatchlistItem(
  groupId: string,
  title: string,
  mediaType: 'movie' | 'tv',
  addedBy: string,
  tmdbId: number,
  posterPath: string | null,
  releaseYear: string | null,
  description: string | null
) {
  // First, get or create the media in the media table
  const media = await getOrCreateMedia(
    tmdbId,
    mediaType,
    title,
    releaseYear,
    description,
    posterPath
  )

  // Then, add the watchlist item with the media_id
  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({
      group_id: groupId,
      media_id: media.id,
      added_by: addedBy,
      status: 'not_watched',
    })
    .select(`
      *,
      media:media(*)
    `)
    .single()

  if (error) {
    console.error('Error adding watchlist item:', error)
    throw error
  }

  return data as WatchlistItem
}

export async function updateWatchlistStatus(
  itemId: string,
  status: 'watched' | 'not_watched'
) {
  const { data, error } = await supabase
    .from('watchlist_items')
    .update({ status })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating watchlist item status:', error)
    throw error
  }

  return data as WatchlistItem
}

export async function deleteWatchlistItem(itemId: string) {
  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error deleting watchlist item:', error)
    throw error
  }

  return true
}
