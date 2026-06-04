import { FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Field, Page, inputClass } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { createCategory, deleteCategoryRecord, updateCategory } from '../services/documentService'

export function CategoriesPage({ data }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState('')
  const [status, setStatus] = useState('')

  async function saveCategory(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    setStatus('')
    try {
      if (editingId) {
        const savedCategory = await updateCategory(editingId, form)
        data.setCategories((items) => items.map((item) => item.id === editingId ? { ...item, ...savedCategory } : item))
        data.addActivity('Category Updated', `${form.name} category was updated.`, user.id)
        setEditingId('')
      } else {
        const savedCategory = await createCategory(form)
        data.setCategories((items) => [savedCategory, ...items])
        data.addActivity('Category Added', `${form.name} category was added.`, user.id)
      }
      setForm({ name: '', description: '' })
    } catch (error) {
      setStatus(error.message || 'Unable to save category.')
    }
  }

  async function deleteCategory(id) {
    const category = data.categories.find((item) => item.id === id)
    if (!window.confirm(`Delete "${category?.name}"? Files in this category will become uncategorized.`)) return
    setStatus('')
    try {
      await deleteCategoryRecord(id)
      data.setCategories((items) => items.filter((item) => item.id !== id))
      data.setFiles((items) => items.map((file) => file.category_id === id ? { ...file, category_id: null } : file))
      data.addActivity('Category Deleted', `${category?.name} category was deleted.`, user.id)
    } catch (error) {
      setStatus(error.message || 'Unable to delete category.')
    }
  }

  function startEdit(category) {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description || '' })
  }

  return (
    <Page title="Categories" description="Maintain official document classifications used across the repository.">
      {(status || data.error) && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{status || data.error}</div>}
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <h3 className="text-lg font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={saveCategory} className="mt-4 space-y-4">
            <Field label="Category Name">
              <input className={inputClass} value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit"><FolderPlus className="h-4 w-4" />{editingId ? 'Save Category' : 'Add Category'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(''); setForm({ name: '', description: '' }) }}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-red-800 text-white">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Files</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.categories.map((category) => (
                  <tr key={category.id} className="hover:bg-red-50/50">
                    <td className="px-4 py-4 font-semibold">{category.name}</td>
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
