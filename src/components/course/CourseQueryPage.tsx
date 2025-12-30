// src/components/CourseQueryPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import CourseTable from '@/components/course/CourseTable'
import type { ViewType, ApiResponse } from '@/types/course'
import { getDateRange } from '@/utils/date'
import {
  getShsmuCookie,
  getShsmuCredentials,
  setShsmuCookie,
  setShsmuCredentials,
} from '@/utils/course'

const API_BASE_URL = 'https://reqwey.xyz/api/shsmu'

const CourseQueryPage: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [currentView, setCurrentView] = useState<ViewType>('day')
  const [courseData, setCourseData] = useState<ApiResponse>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)
  const [monthOffset, setMonthOffset] = useState<number>(0)

  const viewList: { type: ViewType; name: string }[] = [
    { type: 'day', name: '日' },
    { type: 'week', name: '周' },
    { type: 'month', name: '月' },
  ]

  // 提交查询处理
  const handleSubmit = useCallback(async () => {
    if (!username || !password) {
      return
    }

    setLoading(true)
    setError(null)

    const fetchCookie = async (): Promise<string> => {
      let loginResponse = await fetch(`${API_BASE_URL}/login`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      if (!loginResponse.ok) {
        throw new Error(`HTTP ${loginResponse.status}: ${loginResponse.statusText}`)
      }

      const loginData = await loginResponse.json()
      let newCookie = loginData.cookies.wengine_vpn_ticketwebvpn2_shsmu_edu_cn
      if (!newCookie) throw new Error('Cannot parse cookie')
      return newCookie
    }

    const fetchCurriculum = async (
      start: string,
      end: string,
      cookie: string,
    ): Promise<ApiResponse> => {
      let response = await fetch(
        `${API_BASE_URL}/curriculum?start=${start.replaceAll('/', '-')}&end=${end.replaceAll('/', '-')}&cookie=${encodeURIComponent(cookie.trim())}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    }

    try {
      const dateRange = getDateRange(currentView, monthOffset)
      let cookie = getShsmuCookie()
      if (!cookie) {
        cookie = await fetchCookie()
      } else {
        try {
          await fetchCurriculum(dateRange.start, dateRange.start, cookie) // This range is intended to test if cookie is valid
        } catch {
          cookie = await fetchCookie()
        }
      }
      const curriculumData = await fetchCurriculum(dateRange.start, dateRange.end, cookie)
      setCourseData(curriculumData)
      setLastFetchTime(new Date())
      setShsmuCredentials(username, password)
      setShsmuCookie(cookie)
    } catch (err) {
      console.error('请求失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
      setCourseData(undefined)
    } finally {
      setLoading(false)
    }
  }, [username, password, currentView, monthOffset])

  useEffect(() => {
    const { username: storedUsername, password: storedPassword } = getShsmuCredentials()
    if (storedUsername) {
      setUsername(storedUsername)
    }
    if (storedPassword) {
      setPassword(storedPassword)
    }
  }, [])

  useEffect(() => {
    setMonthOffset(0)
    handleSubmit()
  }, [currentView])

  useEffect(() => {
    if (currentView === 'month') {
      handleSubmit()
    }
  }, [monthOffset])

  return (
    <div>
      <form
        className="mb-6 flex flex-col items-stretch justify-between gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="flex flex-col items-stretch justify-between gap-2">
          <label htmlFor="username" className="block text-sm font-medium text-secondary">
            用户名
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="w-full h-8 px-2 bg-transparent text-sm border border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <div className="flex flex-col items-stretch justify-between gap-2">
          <label htmlFor="password" className="block text-sm font-medium text-secondary">
            密码
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full h-8 px-2 bg-transparent text-sm border border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </form>
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
              <i className="iconfont icon-search" />
              查询课程
            </>
          )}
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center justify-between gap-2">
          {currentView === 'month' && courseData && (
            <button
              onClick={() => setMonthOffset(monthOffset - 1)}
              className={
                'px-2 py-1 rounded-full text-sm border border-primary bg-white/50 hover:bg-gray-300 dark:bg-zinc-800/50 hover:dark:bg-zinc-800 text-primary'
              }
            >
              <i className="iconfont icon-left" />
            </button>
          )}
          <h2 className="text-xl font-bold">
            {currentView === 'day'
              ? '今日课程'
              : currentView === 'week'
                ? '本周课程'
                : `${((new Date().getMonth() + monthOffset) % 12) + 1}月课程`}
          </h2>
          {currentView === 'month' && courseData && (
            <button
              onClick={() => setMonthOffset(monthOffset + 1)}
              className={
                'px-2 py-1 rounded-full text-sm border border-primary bg-white/50 hover:bg-gray-300 dark:bg-zinc-800/50 hover:dark:bg-zinc-800 text-primary'
              }
            >
              <i className="iconfont icon-right" />
            </button>
          )}
        </div>
        {lastFetchTime && (
          <div className="text-xs text-secondary">最后更新: {lastFetchTime.toLocaleString()}</div>
        )}
      </div>
      <CourseTable
        view={currentView}
        courseData={courseData}
        monthOffset={monthOffset}
        loading={loading}
        error={error}
      />
    </div>
  )
}

export default CourseQueryPage
