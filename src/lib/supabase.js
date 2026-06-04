import { createClient } from '@supabase/supabase-js'

const fallbackSupabaseUrl = 'https://pafywvucrfjmccmmwgoq.supabase.co'
const fallbackSupabaseAnonKey = 'sb_publishable_vbGQZlO0g4F6U9Mx12G-Kw_pLWOgcDV'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isDemoMode = !isSupabaseConfigured && import.meta.env.DEV

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'mancom-files'
