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

  // First check if user already exists
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .limit(1)
    .maybeSingle()

  console.log('ensureUserExists - Existing user:', existing)
  console.log('ensureUserExists - Select error:', selectError)

  if (selectError) {
    console.error('Error checking existing user in Supabase:', selectError)
    throw selectError
  }

  // If user exists and we have a username but they don't, update them
  if (existing) {
    if (username && !existing.username) {
      console.log('ensureUserExists - Updating existing user with username')
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ username })
        .eq('firebase_uid', firebaseUid)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user with username:', updateError)
        throw updateError
      }
      return updated
    }
    // User exists and either has username or we don't have one to add
    console.log('ensureUserExists - Returning existing user')
    return existing
  }

  // User doesn't exist, create new record
  console.log('ensureUserExists - Creating new user')

  const insertPayload: any = {
    firebase_uid: firebaseUid,
    role: 'member',
  }
  if (email) insertPayload.email = email
  if (username) insertPayload.username = username

  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert(insertPayload)
    .select()
    .single()

  console.log('ensureUserExists - Inserted user:', inserted)
  console.log('ensureUserExists - Insert error:', insertError)

  if (insertError) {
    console.error('Error inserting user into Supabase:', insertError)
    throw insertError
  }

  return inserted
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
