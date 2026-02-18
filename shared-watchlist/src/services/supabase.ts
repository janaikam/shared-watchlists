import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export async function ensureUserExists(firebaseUid: string, email?: string | null, username?: string | null) {
  if (!firebaseUid) throw new Error('firebaseUid is required')

  console.log('ensureUserExists - Firebase UID:', firebaseUid)
  console.log('ensureUserExists - Email:', email)
  console.log('ensureUserExists - Username:', username)

  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('id, firebase_uid')
    .eq('firebase_uid', firebaseUid)
    .limit(1)
    .maybeSingle()

  console.log('ensureUserExists - Existing user:', existing)
  console.log('ensureUserExists - Select error:', selectError)

  if (selectError) {
    console.error('Error checking existing user in Supabase:', selectError)
    throw selectError
  }

  if (existing) {
    console.log('ensureUserExists - Returning existing user')
    return existing
  }

  console.log('ensureUserExists - Creating new user')

  const insertPayload: any = {
    firebase_uid: firebaseUid,
    role: 'member',
  }
  if (email) insertPayload.email = email
  if (username) insertPayload.username = username

  // Use upsert to avoid race conditions: if a row with same firebase_uid exists, do nothing
  const { data: upserted, error: upsertError } = await supabase
    .from('users')
    .upsert(insertPayload, { onConflict: 'firebase_uid' })
    .select()
    .single()

  console.log('ensureUserExists - Upserted user:', upserted)
  console.log('ensureUserExists - Upsert error:', upsertError)

  if (upsertError) {
    console.error('Error upserting user into Supabase:', upsertError)
    throw upsertError
  }

  return upserted
}

export async function getEmailByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('username', username)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching email by username:', error)
    return null
  }

  return data?.email ?? null
}

export async function getUsernameByFirebaseUid(firebaseUid: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('firebase_uid', firebaseUid)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching username by firebase uid:', error)
    return null
  }

  return data?.username ?? null
}
