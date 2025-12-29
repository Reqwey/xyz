// src/components/CourseQueryPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import CourseTable from './CourseTable'
import type { ViewType, ApiResponse } from '@/types/course'
import { getDateRange } from '@/utils/date'
import { getShsmuCookie, setShsmuCookie } from '@/utils/course'

const CourseQueryPage: React.FC = () => {
  const [cookie, setCookie] = useState<string>('')
  const [currentView, setCurrentView] = useState<ViewType>('day')
  const [courseData, setCourseData] = useState<ApiResponse>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  const viewList: { type: ViewType; name: string }[] = [
    { type: 'day', name: '日' },
    { type: 'week', name: '周' },
    { type: 'month', name: '月' },
  ]

  // 提交查询处理
  const handleSubmit = useCallback(async () => {
    if (!cookie.trim()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dateRange = getDateRange(currentView)
      const url = `https://reqwey.xyz/api/curriculum?start=${dateRange.start}&end=${dateRange.end}&cookie=${encodeURIComponent(cookie.trim())}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setCourseData(data)
      setLastFetchTime(new Date())
      setShsmuCookie(cookie)
    } catch (err) {
      console.error('请求失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
      setCourseData(undefined)
    } finally {
      setLoading(false)
    }
  }, [currentView, cookie])

  useEffect(() => {
    const storedCookie = getShsmuCookie()
    if (storedCookie) {
      setCookie(storedCookie)
    }
  }, [])

  useEffect(() => {
    handleSubmit()
  }, [currentView])

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="cookie" className="block text-sm font-medium text-secondary mb-2">
          Cookie
        </label>
        <input
          type="password"
          id="cookie"
          value={cookie}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCookie(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
          placeholder="wengin_vpn_ticketwebvpn2_shsmu_edu_cn"
          className="w-full px-2 py-1 bg-transparent text-sm border border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex gap-2">
          {viewList.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentView(item.type)}
              className={`px-2 py-1 rounded-full text-sm border border-primary ${
                currentView === item.type
                  ? 'bg-accent/10 text-accent shadow-md'
                  : 'bg-white/50 hover:bg-gray-300 dark:bg-zinc-800/50 hover:dark:bg-zinc-800 text-primary'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm transition hover:bg-accent/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              查询中...
            </>
          ) : (
            <>
              <i className="iconfont icon-search"></i>
              查询课程
            </>
          )}
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {currentView === 'day'
            ? '今日课程'
            : currentView === 'week'
              ? '本周课程'
              : `${new Date().getMonth() + 1}月课程`}
        </h2>
        {lastFetchTime && (
          <div className="text-xs text-secondary">最后更新: {lastFetchTime.toLocaleString()}</div>
        )}
      </div>
      <CourseTable view={currentView} courseData={courseData} loading={loading} error={error} />
    </div>
  )
}

export default CourseQueryPage
