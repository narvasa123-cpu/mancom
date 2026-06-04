import { useEffect, useMemo, useState } from 'react'
import { currentUser, roles } from '../data/mockData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { AuthContext } from './authContext'

const demoPasswords = {
  'admin@mancom.gov': roles.ADMIN,
  'secretary@mancom.gov': roles.SECRETARY,
  'staff@mancom.gov': roles.STAFF,
}

function authUserFallback(sessionUser) {
  return {
    id: sessionUser.id,
    fullname: sessionUser.user_metadata?.fullname || sessionUser.email?.split('@')[0] || 'Authenticated User',
    email: sessionUser.email,
    role: roles.STAFF,
    status: 'Active',
    last_login: null,
    missingProfile: true,
  }
}

async function createOwnStaffProfile(sessionUser) {
  const profile = authUserFallback(sessionUser)
  const insertableProfile = { ...profile }
  delete insertableProfile.missingProfile
  const { data, error } = await supabase
    .from('users')
    .insert(insertableProfile)
    .select()
    .maybeSingle()

  if (error) return profile
  return data || profile
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProfile(sessionUser) {
      const { data: profile, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).maybeSingle()
      if (error) throw error
      return profile || createOwnStaffProfile(sessionUser)
    }

    async function loadUser() {
      if (!isSupabaseConfigured) {
        const remembered = localStorage.getItem('mancom-demo-user')
        if (mounted) setUser(remembered ? JSON.parse(remembered) : currentUser)
        if (mounted) setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user
      if (!sessionUser) {
        if (mounted) setUser(null)
        if (mounted) setLoading(false)
        return
      }

      const profile = await loadProfile(sessionUser)
      if (mounted) setUser(profile)
      if (mounted) setLoading(false)
    }

    loadUser()

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null)
        return
      }
      const profile = await loadProfile(session.user)
      setUser(profile)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn({ email, password, remember }) {
    if (!isSupabaseConfigured) {
      if (!password) throw new Error('Password is required.')
      const role = demoPasswords[email] || roles.ADMIN
      const demoUser = {
        ...currentUser,
        email,
        role,
        fullname: role === roles.STAFF ? 'Staff Demo User' : role === roles.SECRETARY ? 'Secretary Demo User' : 'Administrator Demo User',
      }
      setUser(demoUser)
      if (remember) localStorage.setItem('mancom-demo-user', JSON.stringify(demoUser))
      return demoUser
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle()
    if (profileError) throw profileError
    const nextUser = profile || await createOwnStaffProfile(data.user)
    setUser(nextUser)
    return nextUser
  }

  async function signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    localStorage.removeItem('mancom-demo-user')
    setUser(null)
  }

  async function resetPassword(email) {
    if (!isSupabaseConfigured) return true
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) throw error
    return true
  }

  const value = useMemo(() => ({ user, loading, signIn, signOut, resetPassword }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
