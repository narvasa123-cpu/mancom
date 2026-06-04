import axios from 'axios'
import { isSupabaseConfigured, storageBucket, supabase } from '../lib/supabase'
import { getFileExtension } from '../lib/utils'

export const allowedFileTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'zip']
export const maxFileSize = 50 * 1024 * 1024

export function validateUpload(file) {
  if (!file) return 'Please choose a file to upload.'
  const extension = getFileExtension(file.name)
  if (!allowedFileTypes.includes(extension)) {
    return `Unsupported file type. Allowed: ${allowedFileTypes.join(', ').toUpperCase()}.`
  }
  if (file.size > maxFileSize) {
    return 'File is too large. Maximum upload size is 50 MB.'
  }
  return null
}

function createStoragePath({ fileName, userId, prefix = '' }) {
  const extension = getFileExtension(fileName)
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '')
  const safeBaseName = nameWithoutExtension
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120) || 'document'
  const safePrefix = prefix ? `${prefix}-` : ''

  return `${userId}/${Date.now()}-${safePrefix}${safeBaseName}.${extension}`
}

export async function fetchAppData() {
  if (!isSupabaseConfigured) return null

  const [
    filesResult,
    categoriesResult,
    usersResult,
    logsResult,
    notificationsResult,
    notesResult,
    versionsResult,
    eventsResult,
  ] = await Promise.all([
    supabase.from('files').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name', { ascending: true }),
    supabase.from('users').select('*').order('fullname', { ascending: true }),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(250),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('file_notes').select('*').order('created_at', { ascending: false }),
    supabase.from('file_versions').select('*').order('created_at', { ascending: false }),
    supabase.from('calendar_events').select('*').order('event_date', { ascending: true }),
  ])

  const failed = [
    filesResult,
    categoriesResult,
    usersResult,
    logsResult,
    notificationsResult,
    notesResult,
    versionsResult,
    eventsResult,
  ].find((result) => result.error)

  if (failed?.error) throw failed.error

  return {
    files: filesResult.data || [],
    categories: categoriesResult.data || [],
    users: usersResult.data || [],
    activityLogs: logsResult.data || [],
    notifications: notificationsResult.data || [],
    fileNotes: notesResult.data || [],
    fileVersions: versionsResult.data || [],
    calendarEvents: eventsResult.data || [],
  }
}

export async function uploadDocument({ file, metadata, userId }) {
  const validationError = validateUpload(file)
  if (validationError) throw new Error(validationError)

  if (!isSupabaseConfigured) {
    await axios.get('/').catch(() => null)
    return {
      id: crypto.randomUUID(),
      ...metadata,
      file_size: file.size,
      file_type: getFileExtension(file.name),
      uploaded_by: userId,
      version: 1,
      file_url: URL.createObjectURL(file),
      created_at: new Date().toISOString(),
    }
  }

  const extension = getFileExtension(file.name)
  const path = createStoragePath({ fileName: file.name, userId })
  const { error: uploadError } = await supabase.storage.from(storageBucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('files')
    .insert({
      ...metadata,
      file_url: path,
      file_path: path,
      file_size: file.size,
      file_type: extension,
      uploaded_by: userId,
      version: 1,
    })
    .select()
    .single()

  if (error) throw error

  const { error: versionError } = await supabase.from('file_versions').insert({
    file_id: data.id,
    version: 1,
    name: file.name,
    file_url: path,
    file_path: path,
    file_size: file.size,
    uploaded_by: userId,
  })

  if (versionError) throw versionError
  return data
}

export async function uploadDocumentVersion({ file, document, userId }) {
  const validationError = validateUpload(file)
  if (validationError) throw new Error(validationError)

  const nextVersion = Number(document.version || 1) + 1

  if (!isSupabaseConfigured) {
    await axios.get('/').catch(() => null)
    const version = {
      id: crypto.randomUUID(),
      file_id: document.id,
      version: nextVersion,
      name: file.name,
      file_url: URL.createObjectURL(file),
      file_size: file.size,
      uploaded_by: userId,
      created_at: new Date().toISOString(),
    }
    return {
      version,
      document: {
        ...document,
        file_url: version.file_url,
        file_size: file.size,
        file_type: getFileExtension(file.name),
        version: nextVersion,
        updated_at: version.created_at,
      },
    }
  }

  const extension = getFileExtension(file.name)
  const path = createStoragePath({ fileName: file.name, userId, prefix: `v${nextVersion}` })
  const { error: uploadError } = await supabase.storage.from(storageBucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) throw uploadError

  const { data: version, error: versionError } = await supabase
    .from('file_versions')
    .insert({
      file_id: document.id,
      version: nextVersion,
      name: file.name,
      file_url: path,
      file_path: path,
      file_size: file.size,
      uploaded_by: userId,
    })
    .select()
    .single()

  if (versionError) throw versionError

  const { data: updatedDocument, error: updateError } = await supabase
    .from('files')
    .update({
      file_url: path,
      file_path: path,
      file_size: file.size,
      file_type: extension,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', document.id)
    .select()
    .single()

  if (updateError) throw updateError
  return { version, document: updatedDocument }
}

export async function createActivityLog(payload) {
  if (!isSupabaseConfigured) return payload
  const { error } = await supabase.from('activity_logs').insert(payload)
  if (error) throw error
  return payload
}

export async function createNotification(payload) {
  if (!isSupabaseConfigured) return payload
  const { error } = await supabase.from('notifications').insert(payload)
  if (error) throw error
  return payload
}

export async function createFileNote(payload) {
  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...payload,
    }
  }

  const { data, error } = await supabase.from('file_notes').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function createCategory(payload) {
  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...payload,
    }
  }

  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, payload) {
  if (!isSupabaseConfigured) return { id, ...payload }

  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCategoryRecord(id) {
  if (!isSupabaseConfigured) return true

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function createCalendarEvent(payload) {
  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...payload,
    }
  }

  const { data, error } = await supabase.from('calendar_events').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateUserStatus(userId, status) {
  if (!isSupabaseConfigured) return { id: userId, status }

  const { data, error } = await supabase.from('users').update({ status }).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function deleteDocument(file) {
  if (!isSupabaseConfigured) return true

  const paths = [file.file_path].filter(Boolean)
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(storageBucket).remove(paths)
    if (storageError) throw storageError
  }

  const { error } = await supabase.from('files').delete().eq('id', file.id)
  if (error) throw error
  return true
}

export async function getFileAccessUrl(file, expiresIn = 300) {
  if (!file) return ''
  if (!isSupabaseConfigured) return file.file_url
  if (!file.file_path) return file.file_url

  const { data, error } = await supabase.storage.from(storageBucket).createSignedUrl(file.file_path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function downloadFile(file, userId) {
  await createActivityLog({
    user_id: userId,
    action: 'Download',
    description: `Downloaded ${file.title}.`,
  }).catch(() => null)

  const url = await getFileAccessUrl(file, 60)
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
