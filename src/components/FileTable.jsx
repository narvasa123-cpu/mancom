import { Download, Eye, FilePenLine, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { roles } from '../data/mockData'
import { formatBytes, formatDate } from '../lib/utils'
import { Badge, Button, Card, inputClass } from './ui'

function formatCategory(category) {
  if (!category) return 'Uncategorized'
  return category.category_year ? `${category.category_year} - ${category.name}` : category.name
}

export function FileTable({ files, categories, users, currentUser, filters, setFilters, onPreview, onDownload, onDelete }) {
  const canEdit = [roles.ADMIN, roles.SECRETARY].includes(currentUser.role)
  const canDelete = currentUser.role === roles.ADMIN
  const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]))
  const years = [...new Set(files.map((file) => categoryById[file.category_id]?.category_year).filter(Boolean))].sort((a, b) => b - a)

  return (
    <Card className="p-0">
      <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_12rem_10rem_8rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search by file name, tags, uploaded by..."
            value={filters.search}
            onChange={(event) => setFilters((state) => ({ ...state, search: event.target.value }))}
          />
        </div>
        <select className={inputClass} value={filters.category} onChange={(event) => setFilters((state) => ({ ...state, category: event.target.value }))}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{formatCategory(category)}</option>)}
        </select>
        <select className={inputClass} value={filters.fileType} onChange={(event) => setFilters((state) => ({ ...state, fileType: event.target.value }))}>
          <option value="">All types</option>
          {[...new Set(files.map((file) => file.file_type))].map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}
        </select>
        <select className={inputClass} value={filters.year} onChange={(event) => setFilters((state) => ({ ...state, year: event.target.value }))}>
          <option value="">All category years</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      <div className="max-h-[64vh] overflow-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-red-800 text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Document</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Uploaded By</th>
              <th className="px-4 py-3 font-semibold">Category Year</th>
              <th className="px-4 py-3 font-semibold">Uploaded</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => (
              <tr key={file.id} className="bg-white transition hover:bg-red-50/60">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">{file.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {file.tags?.map((tag) => <Badge key={tag}>#{tag}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-4">{formatCategory(categories.find((item) => item.id === file.category_id))}</td>
                <td className="px-4 py-4">{users.find((item) => item.id === file.uploaded_by)?.fullname || 'Unknown'}</td>
                <td className="px-4 py-4 font-semibold">{categoryById[file.category_id]?.category_year || 'Uncategorized'}</td>
                <td className="px-4 py-4">{formatDate(file.created_at)}</td>
                <td className="px-4 py-4"><Badge tone="red">{file.file_type.toUpperCase()}</Badge></td>
                <td className="px-4 py-4">{formatBytes(file.file_size)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onPreview(file)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:text-red-700" aria-label={`Preview ${file.title}`}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDownload(file)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:text-red-700" aria-label={`Download ${file.title}`}>
                      <Download className="h-4 w-4" />
                    </button>
                    {canEdit && <Link to={`/files/${file.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:text-red-700" aria-label={`Edit ${file.title}`}><FilePenLine className="h-4 w-4" /></Link>}
                    {canDelete && <button onClick={() => onDelete(file)} className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50" aria-label={`Delete ${file.title}`}><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {files.length} secure document records</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled>Previous</Button>
          <Button variant="outline" disabled>Next</Button>
        </div>
      </div>
    </Card>
  )
}
