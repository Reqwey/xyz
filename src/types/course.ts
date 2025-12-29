// src/types/course.ts
export interface ApiCourseItem {
  ID: number
  Title: string
  Curriculum: string
  CourseCode: string | null
  Classroom: string
  CourseCount: number
  Academy: string
  ClassroomAcademy: string
  Start: string
  End: string
  AllDay: boolean
  BackgroundColor: string | null
  BorderColor: string | null
  ClassInfo: string | null
  CurriculumType: string
  MCSID: string | null
  CSID: number | null
  CurriculumID: number | null
  XXKMID: string | null
  List: any
  Time: any
  StartDate: any
  EndDate: any
  Teacher: string | null
  Content: string | null
  VideoLink: string | null
  SchoolYear: string | null
  Semester: string | null
  TeachingCalendarID: string | null
  PKCIndex: string | null
  ClassTime: string | null
  ScheduleManagerID: string | null
  IDS: string | null
}

export interface ApiResponse {
  Title: string
  List: ApiCourseItem[] | null
  List2: any
  StuExam: any
  Times: any
}

export type ViewType = 'day' | 'week' | 'month'

export interface DateRange {
  start: string
  end: string
}

export interface CourseTableProps {
  view: ViewType
  courseData: ApiResponse | undefined
  monthOffset: number
  loading: boolean
  error: boolean
}
