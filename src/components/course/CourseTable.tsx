import React from 'react'
import type { ApiCourseItem, CourseTableProps } from '@/types/course'
import { isSameDay, getDateRange, getDayName, getFormattedDate } from '@/utils/date'
import { dayNames } from '@/utils/date'

const CourseTable: React.FC<CourseTableProps> = ({ view, courseData, loading, error }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">正在加载课程数据...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">
        <i className="iconfont icon-error text-5xl"></i>
        <p className="font-medium">请求失败: {error}</p>
      </div>
    )
  }

  if (!courseData || !courseData.List || courseData.List.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <i className="iconfont icon-calendar text-5xl"></i>
      </div>
    )
  }

  let range = getDateRange(view)
  // 日视图
  if (view === 'day') {
    const filteredCourses = courseData.List.filter((course) => isSameDay(new Date(course.Start)))
    if (filteredCourses.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          <i className="iconfont icon-calendar text-5xl"></i>
          <p className="font-medium">今日无课程安排</p>
        </div>
      )
    }

    return (
      <ul className="space-y-4">
        {filteredCourses.map((course) => (
          <li>
            <div className="inset-0 rounded-lg bg-accent/10 p-4 border border-primary flex flex-col space-y-2">
              <h2 className="relative font-bold flex items-center text-lg text-primary">
                {course.Curriculum}
                <span className="bg-accent/10 text-accent px-1 ml-2 rounded-full text-xs font-normal">
                  {course.CurriculumType}
                </span>
              </h2>
              <div className="flex flex-wrap gap-2 text-sm text-secondary">
                {course.CourseCode && (
                  <div className="flex items-center gap-1">{`${course.CourseCode}`}</div>
                )}
                <div className="flex items-center gap-1">
                  <i className="iconfont icon-timer"></i>
                  {`${new Date(course.Start).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} ~ ${new Date(course.End).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
                </div>
                <div className="flex items-center gap-1">
                  <i className="iconfont icon-map"></i>
                  {course.ClassroomAcademy}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  // 周视图
  if (view === 'week') {
    let coursesPerWeekDay: { date: Date; name: string; courses: ApiCourseItem[] }[] = dayNames.map(
      (name, index) => {
        let curDay = new Date(range.start)
        curDay.setDate(curDay.getDate() + index)
        return { date: curDay, name, courses: [] }
      },
    )
    courseData.List.forEach((course) => {
      const courseDate = new Date(course.Start)
      const dayEntry = coursesPerWeekDay.find((d) => isSameDay(d.date, courseDate))
      if (dayEntry) {
        dayEntry.courses.push(course)
      }
    })
    return (
      <div className="grid grid-cols-7 gap-2">
        {coursesPerWeekDay.map((day, index) => {
          const dayCourses = day.courses
          return (
            <div
              key={index}
              className={`inset-0 rounded-lg p-1 flex flex-col ${dayCourses.length ? 'bg-accent/10' : 'bg-transparent'}`}
            >
              <span
                className={`font-bold text-center ${
                  getDayName() === day.name ? 'text-accent' : 'text-primary'
                }`}
              >
                {day.name[day.name.length - 1]}
              </span>
              <span
                className={`text-center text-sm mb-2 ${
                  getDayName() === day.name ? 'text-accent' : 'text-secondary'
                }`}
              >
                {day.date.getDate()}
              </span>
              {dayCourses.length === 0 ? (
                <p className="text-center text-xs text-secondary">无课程</p>
              ) : (
                <ul className="space-y-1">
                  {dayCourses.map((course, idx) => (
                    <li
                      key={idx}
                      className="bg-white/50 dark:bg-zinc-800/50 px-1 py-1 rounded text-xs shadow-sm border-l-2 border-accent"
                    >
                      {course.Curriculum}
                      <div className="flex items-center gap-1">
                        <div
                          className={`inline-block text-[0.6rem] ${
                            course.CurriculumType === '考试' ? 'text-red-500' : 'text-secondary'
                          }`}
                        >
                          {course.CurriculumType.slice(0, 2)}
                        </div>
                        <div className="inline-block text-[0.6rem] text-secondary">{`${course.CourseCount}节`}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 月视图
  if (view === 'month') {
    let coursesPerMonthDay: { date: Date; events: ApiCourseItem[] }[] = []
    const startDate = new Date(range.start)
    const endDate = new Date(range.end)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayCourses = courseData.List.filter((course) => isSameDay(new Date(course.Start), d))
      coursesPerMonthDay.push({
        date: new Date(d),
        events: dayCourses,
      })
    }
    return (
      <div className="grid grid-cols-7 gap-1">
        {coursesPerMonthDay.map((course, index) => (
          <div
            key={index}
            className={`inset-0 rounded-lg p-1 flex flex-col ${course.events.length ? 'bg-accent/10' : 'bg-transparent'}`}
          >
            <span
              className={`font-bold text-center ${
                isSameDay(course.date) ? 'text-accent' : 'text-primary'
              }`}
            >
              {dayNames[course.date.getDay()][dayNames[course.date.getDay()].length - 1]}
            </span>
            <span
              className={`text-center text-sm mb-2 ${
                isSameDay(course.date) ? 'text-accent' : 'text-primary'
              }`}
            >
              {course.date.getDate()}
            </span>
            <ul className="space-y-1">
              {course.events.map((event, idx) => (
                <li
                  key={idx}
                  className="bg-white/50 dark:bg-zinc-800/50 px-1 py-1 rounded text-xs shadow-sm border-l-2 border-accent"
                >
                  {event.Curriculum}{' '}
                  <div
                    className={`text-[0.6rem] ${event.CurriculumType === '考试' ? 'text-red-500' : 'text-secondary'}`}
                  >
                    {event.CurriculumType.slice(0, 2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default CourseTable
