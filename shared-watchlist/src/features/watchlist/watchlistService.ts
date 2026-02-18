import { supabase } from '../../services/supabase'

export interface WatchlistItem {
  id: string
  group_id: string
  title: string
  type: string
  added_by: string
  created_at: string
  status: 'watched' | 'not_watched'
}

export async function getWatchlistItems(groupId: string) {
  const { data, error } = await supabase
    .from('watchlist_items')
    .select('*')
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
  type: string,
  addedBy: string
) {
  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({
      group_id: groupId,
      title,
      type,
      added_by: addedBy,
      status: 'not_watched',
    })
    .select()
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
