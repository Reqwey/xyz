import type { DateRange, ViewType } from '@/types/course'

export const getDateRange = (view: ViewType): DateRange => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const date = now.getDate()

  if (view === 'day') {
    const start = new Date(year, month, date)
    const end = new Date(year, month, date)
    end.setDate(start.getDate() + 1)
    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString(),
    }
  }

  if (view === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day
    const sunday = new Date(year, month, diff)
    const nextSunday = new Date(sunday)
    nextSunday.setDate(sunday.getDate() + 7)
    return {
      start: sunday.toLocaleDateString(),
      end: nextSunday.toLocaleDateString(),
    }
  }

  if (view === 'month') {
    const firstDay = new Date(year, month, 1)
    firstDay.setDate(firstDay.getDate() - firstDay.getDay()) // 补齐上个月的天数
    const lastDay = new Date(year, month + 1, 0)
    lastDay.setDate(lastDay.getDate() + 6 - lastDay.getDay()) // 补齐下个月的天数
    return {
      start: firstDay.toLocaleDateString(),
      end: lastDay.toLocaleDateString(),
    }
  }

  return { start: '', end: '' }
}

export const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export const getDayName = (dateString?: string): string => {
  const date = dateString ? new Date(dateString) : new Date()
  return dayNames[date.getDay()]
}

// 获取两个日期的相对时间
export function getRelativeTime(startDate: Date, endDate = new Date()) {
  const diffSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  if (diffSeconds < 0) {
    return null
  }
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 10) {
    return '刚刚'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 10) {
    return `${diffDays} 天前`
  }
  return null
}

export function isSameDay(date1: Date, date2 = new Date()) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// 获取一个格式化的日期，格式为：2024 年 1 月 1 日 星期一
export function getFormattedDate(date: Date, withWeek = true) {
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = dayNames[date.getDay()]

  return `${year} 年 ${month} 月 ${day} 日 ${withWeek ? week : ''}`
}

// 数字前补 0
function padZero(number: number, len = 2) {
  return number.toString().padStart(len, '0')
}

// 获取格式化后的日期时间，格式：2024 年 01 月 01 日 12:00
export function getFormattedDateTime(date: Date) {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())

  return `${year} 年 ${month} 月 ${day} 日 ${hours}:${minutes}`
}

// 获取两个日期的相差的天数
export function getDiffInDays(startDate: Date, endDate = new Date()) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 86400))
}

// 获取一个短的日期，格式为：04-20
export function getShortDate(date: Date) {
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())

  return `${month}-${day}`
}

// 获取日期所在的年一共多少天
export function getDaysInYear(date: Date) {
  const year = date.getFullYear()
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    return 366
  }
  return 365
}

// 获取日期所在的年的开始日期
export function getStartOfYear(date: Date) {
  const year = date.getFullYear()
  return new Date(year, 0, 1)
}

// 获取日期所在的天的开始日期
export function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
