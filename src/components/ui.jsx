import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

export function Page({ title, description, actions, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          {description && <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </motion.div>
  )
}

export function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-red-600 text-white shadow-lg shadow-red-100 hover:bg-red-700',
        variant === 'secondary' && 'bg-red-50 text-red-800 hover:bg-red-100',
        variant === 'outline' && 'border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-700',
        variant === 'danger' && 'bg-red-700 text-white hover:bg-red-800',
        className,
      )}
      {...props}
    />
  )
}

export function Card({ className, children }) {
  return <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>{children}</section>
}

export function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-700 to-red-600 p-5 text-white shadow-xl shadow-red-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-100">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-sm text-red-50">{detail}</p>
    </motion.div>
  )
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    red: 'bg-red-50 text-red-700 ring-red-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', tones[tone])}>{children}</span>
}

export function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100'
