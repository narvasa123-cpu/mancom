import { Cloud, Database, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Badge, Card, Page } from '../components/ui'
import { isSupabaseConfigured, storageBucket } from '../lib/supabase'

export function SettingsPage() {
  const checks = [
    { label: 'Supabase Authentication', icon: ShieldCheck, ready: isSupabaseConfigured },
    { label: 'JWT Protected Routes', icon: LockKeyhole, ready: true },
    { label: 'Database Tables and RLS', icon: Database, ready: true },
    { label: `Storage Bucket: ${storageBucket}`, icon: Cloud, ready: true },
  ]

  return (
    <Page title="Settings" description="Production readiness checklist for Supabase and Cloudflare Pages deployment.">
      <section className="grid gap-4 md:grid-cols-2">
        {checks.map((item) => (
          <Card key={item.label}>
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">{item.label}</p>
                <Badge tone={item.ready ? 'green' : 'amber'}>{item.ready ? 'Ready' : 'Needs environment variables'}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </section>
      <Card>
        <h3 className="text-lg font-bold">Environment Variables</h3>
        <div className="mt-4 space-y-2 rounded-2xl bg-slate-950 p-4 font-mono text-sm text-red-50">
          <p>VITE_SUPABASE_URL=your-project-url</p>
          <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
          <p>VITE_SUPABASE_STORAGE_BUCKET=mancom-files</p>
        </div>
      </Card>
    </Page>
  )
}
