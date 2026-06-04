import { Download, FileText, History, MessageSquareText, Save, UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, Field, Page, inputClass } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { roles } from '../data/mockData'
import { formatBytes, formatDateTime, isPreviewable } from '../lib/utils'
import { createFileNote, downloadFile, getFileAccessUrl, uploadDocumentVersion, validateUpload } from '../services/documentService'

export function FileDetails({ data }) {
  const { id } = useParams()
  const { user } = useAuth()
  const file = data.files.find((item) => item.id === id)
  const [note, setNote] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState('')
  const [versionUploading, setVersionUploading] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPreview() {
      await Promise.resolve()
      if (!active) return
      setPreviewUrl('')
      if (!file || !isPreviewable(file.file_type) || file.file_url === '#') return
      try {
        const url = await getFileAccessUrl(file, 300)
        if (active) setPreviewUrl(url)
      } catch (error) {
        if (active) setStatus(error.message || 'Unable to load preview.')
      }
    }

    loadPreview()
    return () => {
      active = false
    }
  }, [file])

  if (!file) {
    return (
      <Page title="Document not found" description="The selected document record is unavailable or has been removed.">
        <Link to="/files"><Button variant="secondary">Back to repository</Button></Link>
      </Page>
    )
  }

  const category = data.lookups.categoryById[file.category_id]
  const uploader = data.lookups.userById[file.uploaded_by]
  const notes = data.fileNotes.filter((item) => item.file_id === file.id)
  const versions = data.fileVersions.filter((item) => item.file_id === file.id).sort((a, b) => b.version - a.version)
  const canEdit = [roles.ADMIN, roles.SECRETARY].includes(user.role)

  async function saveNote() {
    if (!note.trim()) return
    setStatus('')
    try {
      const savedNote = await createFileNote({ file_id: file.id, note: note.trim(), created_by: user.id })
      data.setFileNotes((items) => [savedNote, ...items])
      data.addActivity('Note Added', `${user.fullname} added a note to ${file.title}.`, user.id)
      setNote('')
      setStatus('Note saved.')
    } catch (error) {
      setStatus(error.message || 'Unable to save note.')
    }
  }

  async function handleDownload() {
    try {
      await downloadFile(file, user.id)
      data.addActivity('File Download', `${user.fullname} downloaded ${file.title}.`, user.id)
    } catch (error) {
      setStatus(error.message || 'Unable to download file.')
    }
  }

  async function handleVersionDownload(version) {
    try {
      await downloadFile({ ...file, ...version, title: `${file.title} v${version.version}` }, user.id)
      data.addActivity('Version Download', `${user.fullname} downloaded ${file.title} v${version.version}.`, user.id)
    } catch (error) {
      setStatus(error.message || 'Unable to download version.')
    }
  }

  async function handleNewVersion(fileToUpload) {
    if (!fileToUpload) return
    const validationError = validateUpload(fileToUpload)
    if (validationError) {
      setStatus(validationError)
      return
    }

    setVersionUploading(true)
    setStatus('')
    try {
      const result = await uploadDocumentVersion({ file: fileToUpload, document: file, userId: user.id })
      data.setFiles((items) => items.map((item) => item.id === file.id ? result.document : item))
      data.setFileVersions((items) => [result.version, ...items])
      data.addActivity('Version Uploaded', `${user.fullname} uploaded v${result.version.version} of ${file.title}.`, user.id)
      await data.refreshData()
      setStatus(`Version ${result.version.version} uploaded.`)
    } catch (error) {
      setStatus(error.message || 'Unable to upload new version.')
    } finally {
      setVersionUploading(false)
    }
  }

  return (
    <Page
      title={file.title}
      description={file.description}
      actions={<Button onClick={handleDownload}><Download className="h-4 w-4" />Download</Button>}
    >
      {(status || data.error) && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{status || data.error}</div>}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">File Preview</h3>
              <p className="text-sm text-slate-500">PDF and image files can be previewed directly.</p>
            </div>
            <Badge tone="red">v{file.version}</Badge>
          </div>

          <div className="grid min-h-[22rem] place-items-center rounded-2xl border border-slate-200 bg-slate-100 p-6">
            {isPreviewable(file.file_type) && previewUrl ? (
              file.file_type === 'pdf' ? <iframe title={file.title} src={previewUrl} className="h-[32rem] w-full rounded-xl bg-white" /> : <img src={previewUrl} alt={file.title} className="max-h-[32rem] rounded-xl object-contain" />
            ) : (
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white text-red-700 shadow-sm">
                  <FileText className="h-10 w-10" />
                </div>
                <p className="mt-4 font-semibold">Preview is not available for {file.file_type.toUpperCase()} files</p>
                <p className="mt-2 text-sm text-slate-500">Download the file to view it in the appropriate office application.</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold">File Information</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Category</dt><dd className="font-semibold">{category?.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Uploaded By</dt><dd className="font-semibold">{uploader?.fullname}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Date Uploaded</dt><dd className="font-semibold">{formatDateTime(file.created_at)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">File Type</dt><dd className="font-semibold">{file.file_type.toUpperCase()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">File Size</dt><dd className="font-semibold">{formatBytes(file.file_size)}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {file.tags?.map((tag) => <Badge key={tag}>#{tag}</Badge>)}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-red-700" />
              <h3 className="text-lg font-bold">Internal Notes</h3>
            </div>
            {canEdit && (
              <div className="mb-4 space-y-3">
                <Field label="Secretary Comments and Remarks">
                  <textarea className={`${inputClass} min-h-24`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add internal notes, secretary comments, or handling remarks" />
                </Field>
                <Button type="button" onClick={saveNote}><Save className="h-4 w-4" />Save Note</Button>
              </div>
            )}
            <div className="space-y-3">
              {notes.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">{item.note}</p>
                  <p className="mt-2 text-xs text-slate-400">{data.lookups.userById[item.created_by]?.fullname} · {formatDateTime(item.created_at)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-red-700" />
            <h3 className="text-lg font-bold">Version History</h3>
          </div>
          {canEdit && (
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100">
              <UploadCloud className="h-4 w-4" />
              {versionUploading ? 'Uploading...' : 'Upload New Version'}
              <input type="file" className="sr-only" disabled={versionUploading} onChange={(event) => handleNewVersion(event.target.files?.[0])} />
            </label>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-red-800 text-white">
              <tr>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((version) => (
                <tr key={version.id} className="hover:bg-red-50/50">
                  <td className="px-4 py-3"><Badge tone={version.version === file.version ? 'green' : 'slate'}>v{version.version}</Badge></td>
                  <td className="px-4 py-3 font-semibold">{version.name}</td>
                  <td className="px-4 py-3">{data.lookups.userById[version.uploaded_by]?.fullname}</td>
                  <td className="px-4 py-3">{formatDateTime(version.created_at)}</td>
                  <td className="px-4 py-3">{formatBytes(version.file_size)}</td>
                  <td className="px-4 py-3 text-right"><Button variant="outline" onClick={() => handleVersionDownload(version)}><Download className="h-4 w-4" />Download</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  )
}
