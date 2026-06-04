import { Eye, EyeOff, FileArchive, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/authContext'
import { Button, inputClass } from '../components/ui'
import { isSupabaseConfigured } from '../lib/supabase'

export function Login() {
  const { user, signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: 'admin@mancom.gov', password: 'password', remember: true },
  })

  if (user) return <Navigate to="/" replace />

  async function onSubmit(values) {
    setMessage('')
    try {
      await signIn(values)
      navigate('/')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleForgotPassword() {
    const email = getValues('email')
    if (!email) {
      setMessage('Enter your email first, then request password reset.')
      return
    }
    await resetPassword(email)
    setMessage('Password reset instructions were sent if the account exists.')
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-red-950 via-red-800 to-red-600 px-4 py-10">
      <motion.div className="absolute left-10 top-16 h-32 w-32 rounded-full border border-white/20" animate={{ y: [0, 16, 0] }} transition={{ duration: 7, repeat: Infinity }} />
      <motion.div className="absolute bottom-12 right-12 h-48 w-48 rounded-[2rem] border border-white/20" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity }} />

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-white/20 bg-white/15 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <FileArchive className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold">MANCOM Secretary File System</h1>
          <p className="mt-2 text-sm text-red-50">Secure document management for authorized personnel</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-white">Email Address</span>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-9`} type="email" {...register('email', { required: 'Email is required' })} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-100">{errors.email.message}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-white">Password</span>
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} px-9`} type={showPassword ? 'text' : 'password'} {...register('password', { required: 'Password is required' })} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" className="h-4 w-4 rounded border-white/30 text-red-600 focus:ring-red-200" {...register('remember')} />
              Remember me
            </label>
            <button type="button" onClick={handleForgotPassword} className="font-semibold text-white underline-offset-4 hover:underline">Forgot password?</button>
          </div>

          {message && <div className="rounded-xl bg-white/15 px-3 py-2 text-sm text-white">{message}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in securely'}
          </Button>

          {!isSupabaseConfigured && (
            <p className="text-center text-xs text-red-50">Demo accepts admin@mancom.gov, secretary@mancom.gov, or staff@mancom.gov.</p>
          )}
        </form>
      </motion.div>
    </div>
  )
}
