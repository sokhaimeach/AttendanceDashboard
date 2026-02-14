import { StudentInterface } from './student.model';

export interface AttendanceReportInterface {
  student_id: number;
  studentname_kh: string;
  studentname_en: string;
  gender: string;
  class_id: string;
  attendance: Attendance[];
  total_p: number;
  total_a: number;
  total_ap: number;
  total_l: number;
  total: number;
}

interface Attendance {
  attendance_id: number;
  subject_id: number;
  status: number;
  attendance_date: string | Date;
}

interface DayInterface {
  day: string;
  attendances: AttendanceInterface[];
}

export interface AttendanceInterface {
  attendance_id: number;
  subject_id: number;
  subject_name: string;
  attendance_date: string | Date;
  status: number;
}

export interface CreateAttendanceInterface {
  student_id: number;
  subject_id: number;
  teacher_id: number;
  status: number;
}
