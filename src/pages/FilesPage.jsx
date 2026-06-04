import { FilePlus2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileTable } from '../components/FileTable'
import { Button, Page } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { deleteDocument, downloadFile } from '../services/documentService'

export function FilesPage({ data }) {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ search: '', category: '', fileType: '', year: '', month: '' })
  const [status, setStatus] = useState('')

  const filteredFiles = useMemo(() => {
    const term = filters.search.toLowerCase()
    return data.files.filter((file) => {
      const uploadedBy = data.lookups.userById[file.uploaded_by]?.fullname || ''
      const category = data.lookups.categoryById[file.category_id]?.name || ''
      const created = new Date(file.created_at)
      return (
        (!term || [file.title, file.description, category, uploadedBy, ...(file.tags || [])].join(' ').toLowerCase().includes(term)) &&
        (!filters.category || file.category_id === filters.category) &&
        (!filters.fileType || file.file_type === filters.fileType) &&
        (!filters.year || String(created.getFullYear()) === String(filters.year)) &&
        (!filters.month || String(created.getMonth() + 1) === String(filters.month))
      )
    })
  }, [data.files, data.lookups, filters])

  async function handleDelete(file) {
    if (!window.confirm(`Delete "${file.title}" from the repository?`)) return
    setStatus('')
    try {
      await deleteDocument(file)
      data.setFiles((items) => items.filter((item) => item.id !== file.id))
      data.setFileNotes((items) => items.filter((item) => item.file_id !== file.id))
      data.setFileVersions((items) => items.filter((item) => item.file_id !== file.id))
      data.addActivity('File Deleted', `${file.title} was deleted.`, user.id)
      setStatus(`${file.title} was deleted.`)
    } catch (error) {
      setStatus(error.message || 'Unable to delete file.')
    }
  }

  async function handleDownload(file) {
    try {
      await downloadFile(file, user.id)
      data.addActivity('File Download', `${user.fullname} downloaded ${file.title}.`, user.id)
    } catch (error) {
      setStatus(error.message || 'Unable to download file.')
    }
  }

  return (
    <Page
      title="File Repository"
      description="Search, filter, preview, download, and manage official MANCOM files with role-based permissions."
      actions={<Link to="/upload"><Button><FilePlus2 className="h-4 w-4" />Upload File</Button></Link>}
    >
      {(status || data.error) && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{status || data.error}</div>}
      <FileTable
        files={filteredFiles}
        categories={data.categories}
        users={data.users}
        currentUser={user}
        filters={filters}
        setFilters={setFilters}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </Page>
  )
}
