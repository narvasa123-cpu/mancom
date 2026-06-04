import { FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Card, Field, Page, inputClass } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { createCategory, deleteCategoryRecord, updateCategory } from '../services/documentService'

const currentYear = new Date().getFullYear()

function normalizeCategoryName(name = '') {
  return name.trim().toLowerCase()
}

function formatCategoryLabel(category) {
  const year = category?.category_year || currentYear
  return `${year} - ${category?.name || 'Untitled Category'}`
}

export function CategoriesPage({ data }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', category_year: currentYear, description: '' })
  const [editingId, setEditingId] = useState('')
  const [status, setStatus] = useState('')
  const sortedCategories = useMemo(() => {
    return [...data.categories].sort((a, b) => {
      const yearCompare = Number(b.category_year || currentYear) - Number(a.category_year || currentYear)
      return yearCompare || a.name.localeCompare(b.name)
    })
  }, [data.categories])
  const categoryNameCounts = useMemo(() => {
    return data.categories.reduce((counts, category) => {
      const key = normalizeCategoryName(category.name)
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, {})
  }, [data.categories])
  const categoryYearOptions = useMemo(() => {
    const suggestedYears = Array.from({ length: 7 }, (_, index) => currentYear + 1 - index)
    return [...new Set([...suggestedYears, ...data.categories.map((category) => category.category_year).filter(Boolean)])]
      .sort((a, b) => b - a)
  }, [data.categories])

  async function saveCategory(event) {
    event.preventDefault()
    const name = form.name.trim()
    if (!name || !form.category_year) return
    setStatus('')
    const payload = { ...form, name, category_year: Number(form.category_year) }
    const duplicate = data.categories.some((category) => {
      return (
        category.id !== editingId &&
        normalizeCategoryName(category.name) === normalizeCategoryName(payload.name) &&
        Number(category.category_year || currentYear) === payload.category_year
      )
    })

    if (duplicate) {
      setStatus(`"${payload.name}" already exists for ${payload.category_year}. Choose a different year or category name.`)
      return
    }

    try {
      if (editingId) {
        const savedCategory = await updateCategory(editingId, payload)
        data.setCategories((items) => items.map((item) => item.id === editingId ? { ...item, ...savedCategory } : item))
        data.addActivity('Category Updated', `${payload.category_year} - ${payload.name} category was updated.`, user.id)
        setEditingId('')
      } else {
        const savedCategory = await createCategory(payload)
        data.setCategories((items) => [savedCategory, ...items])
        data.addActivity('Category Added', `${payload.category_year} - ${payload.name} category was added.`, user.id)
      }
      setForm({ name: '', category_year: currentYear, description: '' })
    } catch (error) {
      setStatus(error.message || 'Unable to save category.')
    }
  }

  async function deleteCategory(id) {
    const category = data.categories.find((item) => item.id === id)
    if (!window.confirm(`Delete "${formatCategoryLabel(category)}"? Files in this category will become uncategorized.`)) return
    setStatus('')
    try {
      await deleteCategoryRecord(id)
      data.setCategories((items) => items.filter((item) => item.id !== id))
      data.setFiles((items) => items.map((file) => file.category_id === id ? { ...file, category_id: null } : file))
      data.addActivity('Category Deleted', `${formatCategoryLabel(category)} category was deleted.`, user.id)
    } catch (error) {
      setStatus(error.message || 'Unable to delete category.')
    }
  }

  function startEdit(category) {
    setEditingId(category.id)
    setForm({ name: category.name, category_year: category.category_year || currentYear, description: category.description || '' })
  }

  return (
    <Page title="Categories" description="Maintain official document classifications used across the repository.">
      {(status || data.error) && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{status || data.error}</div>}
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <h3 className="text-lg font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={saveCategory} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
              <Field label="Year">
                <select
                  className={inputClass}
                  value={form.category_year}
                  onChange={(event) => setForm((state) => ({ ...state, category_year: event.target.value }))}
                >
                  <option value="">Select year</option>
                  {categoryYearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </Field>
              <Field label="Category Name">
                <input className={inputClass} value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} placeholder="Example: Meeting Minutes" />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit"><FolderPlus className="h-4 w-4" />{editingId ? 'Save Category' : 'Add Category'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(''); setForm({ name: '', category_year: currentYear, description: '' }) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-red-800 text-white">
                <tr>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Files</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-red-50/50">
                    <td className="px-4 py-4 font-semibold">{category.category_year || currentYear}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{category.name}</p>
                      {categoryNameCounts[normalizeCategoryName(category.name)] > 1 && (
                        <p className="mt-1 text-xs font-medium text-slate-500">This name is also used in another year.</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500">{category.description}</td>
                    <td className="px-4 py-4">{data.files.filter((file) => file.category_id === category.id).length}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => startEdit(category)}><Pencil className="h-4 w-4" />Edit</Button>
                        <Button variant="danger" onClick={() => deleteCategory(category.id)}><Trash2 className="h-4 w-4" />Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </Page>
  )
}
