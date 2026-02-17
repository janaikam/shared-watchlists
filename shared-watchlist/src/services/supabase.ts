import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export async function ensureUserExists(firebaseUid: string, email?: string | null) {
  if (!firebaseUid) throw new Error('firebaseUid is required')

  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .limit(1)
    .maybeSingle()

  if (selectError) {
    console.error('Error checking existing user in Supabase:', selectError)
    throw selectError
  }

  if (existing) return existing

  const insertPayload: any = {
    firebase_uid: firebaseUid,
    role: 'member',
  }
  if (email) insertPayload.email = email

  // Use upsert to avoid race conditions: if a row with same firebase_uid exists, do nothing
  const { data: upserted, error: upsertError } = await supabase
    .from('users')
    .upsert(insertPayload, { onConflict: 'firebase_uid' })
    .select()
    .single()

  if (upsertError) {
    console.error('Error upserting user into Supabase:', upsertError)
    throw upsertError
  }

  return upserted
}
