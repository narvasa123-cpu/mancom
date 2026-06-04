import { CheckCircle2, FileUp, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button, Card, Field, Page, inputClass } from '../components/ui'
import { useAuth } from '../contexts/authContext'
import { getFileExtension } from '../lib/utils'
import { uploadDocument, validateUpload } from '../services/documentService'

export function UploadPage({ data }) {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()
  const selectedCategoryYear = useWatch({ control, name: 'category_year', defaultValue: '' })
  const categoryYears = useMemo(() => {
    return [...new Set(data.categories.map((category) => category.category_year).filter(Boolean))]
      .sort((a, b) => b - a)
  }, [data.categories])
  const categoriesForSelectedYear = useMemo(() => {
    return data.categories
      .filter((category) => String(category.category_year || '') === String(selectedCategoryYear))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data.categories, selectedCategoryYear])
  const categoryYearField = register('category_year', { required: 'Category year is required' })

  function handleFile(file) {
    setStatus('')
    const error = validateUpload(file)
    if (error) {
      setSelectedFile(null)
      setStatus(error)
      return
    }
    setSelectedFile(file)
  }

  async function onSubmit(values) {
    if (!selectedFile) {
      setStatus('Please select a valid document file.')
      return
    }
    try {
      setProgress(20)
      const metadata = {
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        tags: values.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) || [],
      }
      setProgress(55)
      const document = await uploadDocument({ file: selectedFile, metadata, userId: user.id })
      setProgress(100)
      data.setFiles((items) => [document, ...items])
      data.setFileVersions((items) => [
        {
          id: crypto.randomUUID(),
          file_id: document.id,
          version: 1,
          name: selectedFile.name || `${values.title.replace(/\s+/g, '_')}_v1.${getFileExtension(selectedFile.name)}`,
          file_url: document.file_url,
          file_path: document.file_path,
          uploaded_by: user.id,
          created_at: new Date().toISOString(),
          file_size: selectedFile.size,
        },
        ...items,
      ])
      data.addActivity('File Uploaded', `${user.fullname} uploaded ${values.title}.`, user.id)
      data.addNotification('New File Uploaded', `${values.title} is now available in the repository.`, user.id)
      await data.refreshData()
      setStatus('Upload complete. Document metadata and version history were recorded.')
      setSelectedFile(null)
      reset()
      setTimeout(() => setProgress(0), 1200)
    } catch (error) {
      setProgress(0)
      setStatus(error.message || 'Upload failed.')
    }
  }

  return (
    <Page title="Upload Files" description="Upload validated official documents to Supabase Storage with metadata, tags, and version tracking.">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div
            onDrop={(event) => {
              event.preventDefault()
              handleFile(event.dataTransfer.files?.[0])
            }}
            onDragOver={(event) => event.preventDefault()}
            className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed border-red-600 bg-red-50/50 p-6 text-center transition hover:bg-red-50"
          >
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-red-700 shadow-sm">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="mt-4 text-lg font-bold">Drag and drop official file here</p>
              <p className="mt-2 text-sm text-slate-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, or ZIP up to 50 MB</p>
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-100 hover:bg-red-700">
                <FileUp className="h-4 w-4" />
                Browse File
                <input type="file" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-950">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{getFileExtension(selectedFile.name).toUpperCase()} file selected</p>
            </div>
          )}

          {progress > 0 && (
            <div className="mt-4">
              <div className="h-3 overflow-hidden rounded-full bg-red-100">
                <div className="h-full rounded-full bg-red-600 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {status && <div className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-800"><CheckCircle2 className="h-5 w-5 shrink-0" />{status}</div>}
        </Card>

        <Card className="space-y-4">
          <Field label="File Title" error={errors.title?.message}>
            <input className={inputClass} {...register('title', { required: 'File title is required' })} placeholder="Example: MANCOM Regular Meeting Minutes" />
          </Field>
          <Field label="Description">
            <textarea className={`${inputClass} min-h-28 resize-y`} {...register('description')} placeholder="Brief document summary, context, and handling remarks" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category Year" error={errors.category_year?.message}>
              <select
                className={inputClass}
                {...categoryYearField}
                onChange={(event) => {
                  categoryYearField.onChange(event)
                  setValue('category_id', '')
                }}
              >
                <option value="">Select year</option>
                {categoryYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </Field>
            <Field label="Category" error={errors.category_id?.message}>
              <select
                className={inputClass}
                disabled={!selectedCategoryYear}
                {...register('category_id', { required: 'Category is required' })}
              >
                <option value="">{selectedCategoryYear ? 'Select category' : 'Select year first'}</option>
                {categoriesForSelectedYear.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Tags">
            <input className={inputClass} {...register('tags')} placeholder="minutes, policy, finance" />
          </Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <UploadCloud className="h-4 w-4" />
            {isSubmitting ? 'Uploading...' : 'Upload Secure File'}
          </Button>
        </Card>
      </form>
    </Page>
  )
}
