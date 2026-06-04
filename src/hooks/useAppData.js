import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  activityLogs as seedLogs,
  calendarEvents as seedEvents,
  categories as seedCategories,
  fileNotes as seedNotes,
  files as seedFiles,
  fileVersions as seedVersions,
  notifications as seedNotifications,
  users as seedUsers,
} from '../data/mockData'
import { isSupabaseConfigured } from '../lib/supabase'
import { createActivityLog, createNotification, fetchAppData } from '../services/documentService'

const localStoreKey = 'mancom-app-data'

const seedData = {
  files: seedFiles,
  categories: seedCategories,
  users: seedUsers,
  activityLogs: seedLogs,
  notifications: seedNotifications,
  fileNotes: seedNotes,
  fileVersions: seedVersions,
  calendarEvents: seedEvents,
}

function loadLocalData() {
  try {
    const stored = localStorage.getItem(localStoreKey)
    return stored ? { ...seedData, ...JSON.parse(stored) } : seedData
  } catch {
    return seedData
  }
}

export function useAppData() {
  const initialData = isSupabaseConfigured ? seedData : loadLocalData()
  const [files, setFiles] = useState(initialData.files)
  const [categories, setCategories] = useState(initialData.categories)
  const [users, setUsers] = useState(initialData.users)
  const [activityLogs, setActivityLogs] = useState(initialData.activityLogs)
  const [notifications, setNotifications] = useState(initialData.notifications)
  const [fileNotes, setFileNotes] = useState(initialData.fileNotes)
  const [fileVersions, setFileVersions] = useState(initialData.fileVersions)
  const [calendarEvents, setCalendarEvents] = useState(initialData.calendarEvents)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    setError('')
    try {
      const nextData = await fetchAppData()
      setFiles(nextData.files)
      setCategories(nextData.categories)
      setUsers(nextData.users)
      setActivityLogs(nextData.activityLogs)
      setNotifications(nextData.notifications)
      setFileNotes(nextData.fileNotes)
      setFileVersions(nextData.fileVersions)
      setCalendarEvents(nextData.calendarEvents)
    } catch (refreshError) {
      setError(refreshError.message || 'Unable to load application data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refreshData)
  }, [refreshData])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem(localStoreKey, JSON.stringify({
      files,
      categories,
      users,
      activityLogs,
      notifications,
      fileNotes,
      fileVersions,
      calendarEvents,
    }))
  }, [activityLogs, calendarEvents, categories, fileNotes, fileVersions, files, notifications, users])

  const lookups = useMemo(() => {
    const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]))
    const userById = Object.fromEntries(users.map((user) => [user.id, user]))
    return { categoryById, userById }
  }, [categories, users])

  function addActivity(action, description, userId = 'demo-admin') {
    const activity = {
      id: crypto.randomUUID(),
      user_id: userId,
      action,
      description,
      created_at: new Date().toISOString(),
    }
    setActivityLogs((logs) => [
      activity,
      ...logs,
    ])
    createActivityLog({ user_id: userId, action, description }).catch((activityError) => {
      setError(activityError.message || 'Unable to save activity log.')
    })
  }

  function addNotification(title, message, userId = 'demo-admin') {
    const notification = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      message,
      status: 'Unread',
      created_at: new Date().toISOString(),
    }
    setNotifications((items) => [
      notification,
      ...items,
    ])
    createNotification({ user_id: userId, title, message }).catch((notificationError) => {
      setError(notificationError.message || 'Unable to save notification.')
    })
  }

  return {
    files,
    setFiles,
    categories,
    setCategories,
    users,
    setUsers,
    activityLogs,
    setActivityLogs,
    notifications,
    setNotifications,
    fileNotes,
    setFileNotes,
    fileVersions,
    setFileVersions,
    calendarEvents,
    setCalendarEvents,
    loading,
    error,
    refreshData,
    lookups,
    addActivity,
    addNotification,
  }
}
