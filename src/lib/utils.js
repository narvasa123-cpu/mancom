import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(value, options = {}) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function getFileExtension(name = '') {
  return name.split('.').pop()?.toLowerCase() || ''
}

export function isPreviewable(fileType = '') {
  return ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType.toLowerCase())
}

export function isImagePreview(fileType = '') {
  return ['jpg', 'jpeg', 'png'].includes(fileType.toLowerCase())
}

export function isOfficePreview(fileType = '') {
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType.toLowerCase())
}
