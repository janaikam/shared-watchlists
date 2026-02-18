import { supabase } from '../../services/supabase'
import { ensureUserExists } from '../../services/supabase'

interface GroupRow {
  groups: {
    id: string
    name: string
    description: string
    owner_id: string
    created_at: string
  } | null
}

export async function getGroupsForUser(firebaseUid: string) {
  const user = await ensureUserExists(firebaseUid)
  const userId = user?.id

  console.log('getGroupsForUser - Firebase UID:', firebaseUid)
  console.log('getGroupsForUser - Supabase user:', user)
  console.log('getGroupsForUser - User ID:', userId)

  if (!userId) {
    console.error('getGroupsForUser - No user ID found!')
    return []
  }

  const { data, error } = await supabase
    .from('group_members')
    .select('groups(id, name, description, owner_id, created_at)')
    .eq('user_id', userId)

  console.log('getGroupsForUser - Raw data:', data)
  console.log('getGroupsForUser - Error:', error)

  if (error) {
    console.error('Error fetching user groups:', error)
    throw error
  }

  // data is an array of objects with `groups` key
  const groups = (data ?? [])
    .map((row: any) => row.groups)
    .filter((group): group is NonNullable<typeof group> => group != null)

  console.log('getGroupsForUser - Filtered groups:', groups)
  console.log('getGroupsForUser - Number of groups after filtering:', groups.length)
  return groups
}

export async function createGroup(name: string, firebaseUid: string) {
  const user = await ensureUserExists(firebaseUid)
  const userId = user?.id
  if (!userId) throw new Error('User id not found')

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, owner_id: userId })
    .select()
    .single()

  if (groupError) {
    console.error('Error creating group:', groupError)
    throw groupError
  }

  // add as group member with admin role
  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'admin',
  })

  if (memberError) {
    console.error('Error adding creator to group_members:', memberError)
    throw memberError
  }

  return group
}

export async function joinGroup(groupId: string, firebaseUid: string) {
  const user = await ensureUserExists(firebaseUid)
  const userId = user?.id
  if (!userId) throw new Error('User id not found')

  const payload = { group_id: groupId, user_id: userId, role: 'member' }
  const { data, error } = await supabase
    .from('group_members')
    .upsert(payload, { onConflict: 'group_id,user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error joining group:', error)
    throw error
  }

  return data
}

interface GroupMemberRow {
  user_id: string
  role: string
  joined_at: string
  users: {
    id: string
    firebase_uid: string
    email: string
    created_at: string
  }[]
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, role, joined_at, users(id, firebase_uid, email, created_at)')
    .eq('group_id', groupId)

  if (error) {
    console.error('Error fetching group members:', error)
    throw error
  }

  return (data ?? []).map((row: GroupMemberRow) => ({
    user_id: row.user_id,
    role: row.role,
    joined_at: row.joined_at,
    user: row.users[0],
  }))
}

export async function removeGroupMember(groupId: string, userId: string) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .match({ group_id: groupId, user_id: userId })

  if (error) {
    console.error('Error removing group member:', error)
    throw error
  }

  return true
}

export async function updateMemberRole(groupId: string, userId: string, role: 'member' | 'admin') {
  const { data, error } = await supabase
    .from('group_members')
    .update({ role })
    .match({ group_id: groupId, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Error updating member role:', error)
    throw error
  }

  return data
}
