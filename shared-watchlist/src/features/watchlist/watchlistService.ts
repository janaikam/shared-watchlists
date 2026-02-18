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
  request: number
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
    .order('request', { ascending: false })
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

  // Check if this media already exists in the group's watchlist
  const { data: existingItem, error: checkError } = await supabase
    .from('watchlist_items')
    .select('*')
    .eq('group_id', groupId)
    .eq('media_id', media.id)
    .limit(1)
    .maybeSingle()

  if (checkError) {
    console.error('Error checking existing watchlist item:', checkError)
    throw checkError
  }

  // If item already exists, increment the request count
  if (existingItem) {
    const { data: updated, error: updateError } = await supabase
      .from('watchlist_items')
      .update({ request: (existingItem.request || 0) + 1 })
      .eq('id', existingItem.id)
      .select(`
        *,
        media:media(*)
      `)
      .single()

    if (updateError) {
      console.error('Error incrementing request count:', updateError)
      throw updateError
    }

    return updated as WatchlistItem
  }

  // Item doesn't exist, add it with request = 0
  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({
      group_id: groupId,
      media_id: media.id,
      added_by: addedBy,
      status: 'not_watched',
      request: 0,
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
