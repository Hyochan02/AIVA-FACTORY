/**
 * AIVA FACTORY · 공용 포맷 유틸리티
 */

/** 초(number) → "mm:ss" 문자열 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** 재생 수 → 1.2K / 12.4K 등 단축 표기 */
export const formatPlays = (plays: number): string => {
  if (!plays) return '0'
  if (plays >= 1_000_000) return `${(plays / 1_000_000).toFixed(1)}M`
  if (plays >= 1_000)     return `${(plays / 1_000).toFixed(1)}K`
  return plays.toString()
}

/** ISO 날짜 → "YYYY-MM-DD" */
export const formatDate = (iso: string): string => {
  if (!iso) return ''
  return iso.slice(0, 10)
}

/** ISO 날짜 → 한국어 상대 시간 ("방금 전", "3분 전", "2시간 전") */
export const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  const hr   = Math.floor(diff / 3_600_000)
  const day  = Math.floor(diff / 86_400_000)
  if (min < 1)   return '방금 전'
  if (min < 60)  return `${min}분 전`
  if (hr  < 24)  return `${hr}시간 전`
  if (day < 7)   return `${day}일 전`
  return formatDate(iso)
}

/** 트랙 ID → 그라디언트 클래스 (같은 ID는 항상 같은 색) */
const GRAD_COLORS = [
  'from-indigo-700 to-violet-700',
  'from-blue-900 to-indigo-800',
  'from-violet-800 to-blue-900',
  'from-indigo-800 to-violet-900',
  'from-blue-800 to-indigo-700',
  'from-violet-700 to-blue-900',
]
export const gradColor = (seed: string | number): string => {
  const n = typeof seed === 'string'
    ? seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : seed
  return GRAD_COLORS[n % GRAD_COLORS.length]
}
