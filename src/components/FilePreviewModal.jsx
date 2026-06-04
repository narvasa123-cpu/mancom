import { Download, FileText, Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getFileAccessUrl } from '../services/documentService'
import { formatBytes, formatDateTime, isImagePreview, isOfficePreview, isPreviewable } from '../lib/utils'
import { Badge, Button } from './ui'

export function FilePreviewModal({ file, category, uploader, onClose, onDownload }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const categoryName = useMemo(() => {
    if (!category) return 'Uncategorized'
    return category.category_year ? `${category.category_year} - ${category.name}` : category.name
  }, [category])

  useEffect(() => {
    if (!file) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [file, onClose])

  useEffect(() => {
    let active = true

    async function loadPreview() {
      setPreviewUrl('')
      setStatus('')

      if (!file || !isPreviewable(file.file_type) || file.file_url === '#') {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const url = await getFileAccessUrl(file, 300)
        if (active) setPreviewUrl(url)
      } catch (error) {
        if (active) setStatus(error.message || 'Unable to load preview.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPreview()
    return () => {
      active = false
    }
  }, [file])

  if (!file) return null

  const fileType = file.file_type?.toLowerCase() || ''
  const officePreviewUrl = isOfficePreview(fileType) && previewUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
    : ''

  function renderPreview() {
    if (loading) {
      return (
        <div className="grid h-full min-h-[24rem] place-items-center text-center text-slate-500">
          <div>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-700" />
            <p className="mt-3 text-sm font-semibold">Loading preview...</p>
          </div>
        </div>
      )
    }

    if (status) {
      return (
        <div className="grid h-full min-h-[24rem] place-items-center text-center">
          <div>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-700">
              <FileText className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-slate-950">{status}</p>
          </div>
        </div>
      )
    }

    if (isPreviewable(fileType) && previewUrl) {
      if (fileType === 'pdf') {
        return <iframe title={file.title} src={previewUrl} className="h-full min-h-[32rem] w-full rounded-xl bg-white" />
      }

      if (isImagePreview(fileType)) {
        return <img src={previewUrl} alt={file.title} className="max-h-[70vh] w-full object-contain" />
      }

      return <iframe title={file.title} src={officePreviewUrl} className="h-full min-h-[32rem] w-full rounded-xl bg-white" />
    }

    return (
      <div className="grid h-full min-h-[24rem] place-items-center text-center">
        <div>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white text-red-700 shadow-sm">
            <FileText className="h-10 w-10" />
          </div>
          <p className="mt-4 font-semibold text-slate-950">Preview is not available for {fileType.toUpperCase()} files</p>
          <p className="mt-2 text-sm text-slate-500">Download the file to view it in the appropriate office application.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="file-preview-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="red">{fileType.toUpperCase()}</Badge>
              <Badge>v{file.version}</Badge>
            </div>
            <h3 id="file-preview-title" className="truncate text-xl font-bold text-slate-950">{file.title}</h3>
            {file.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{file.description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onDownload(file)}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:text-red-700" aria-label="Close preview">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_18rem]">
          <div className="min-h-[24rem] overflow-auto bg-slate-100 p-4">
            {renderPreview()}
          </div>
          <aside className="space-y-4 overflow-auto border-t border-slate-200 p-4 lg:border-l lg:border-t-0">
            <div>
              <h4 className="text-sm font-bold text-slate-950">File Information</h4>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-semibold text-slate-900">{categoryName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Uploaded By</dt>
                  <dd className="font-semibold text-slate-900">{uploader?.fullname || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Date Uploaded</dt>
                  <dd className="font-semibold text-slate-900">{formatDateTime(file.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">File Size</dt>
                  <dd className="font-semibold text-slate-900">{formatBytes(file.file_size)}</dd>
                </div>
              </dl>
            </div>

            {file.tags?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-950">Tags</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {file.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
