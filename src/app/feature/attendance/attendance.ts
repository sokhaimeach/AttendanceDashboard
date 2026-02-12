import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentInterface } from '../../models/student.model';
import { Studentservice } from '../../services/student/studentservice';
import { Attendanceservice } from '../../services/attendance/attendanceservice';
import {
  AttendanceReportInterface,
  CreateAttendanceInterface,
} from '../../models/attendance.model';
import { ClassInterface } from '../../models/class.model';
import { Classservice } from '../../services/class/classservice';

interface Student {
  studentid?: number;
  studentname_kh: string;
  studentname_eng: string;
  gender: string;
  classid: number;
  Class?: {
    classname: string;
  };
}

interface Teacher {
  teacherid?: number;
  teachername_kh: string;
  teachername_en: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  subject?: string;
}

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  // inject all need service
  private classservice = inject(Classservice);
  private attendanceservice = inject(Attendanceservice);
  private studentservice = inject(Studentservice);
  // variables
  classes = signal<ClassInterface[]>([]);
  students = signal<StudentInterface[]>([]);
  studentAttendances = signal<AttendanceReportInterface[]>([]);
  attendances: CreateAttendanceInterface[] = [];
  attIndex: number = -1;
  // Weekly Schedule Data
  weeklySchedule = signal<any[]>([]);
  // Week selection
  selectedWeekStart = signal<string>(this.getCurrentWeekStart());
  attendanceDates = computed(() =>
    this.generateWeekDates(this.selectedWeekStart()),
  );
  selectedClassId = signal<number>(0);
  // Removed selectedSubjectId as we now show all subjects
  loading = signal<boolean>(false);
  // Key format: `${studentId}_${date}_${subjectId}`
  // attendanceMap = signal<Map<string, string>>(new Map());
  // attendanceStats = computed(() => {
  //   const map = this.attendanceMap();
  //   let present = 0;
  //   map.forEach((status: string) => {
  //     if (status === 'present') present++;
  //   });
  //   // Calculate total possible slots based on schedule (6 days * 3 slots = 18 slots per student)
  //   const totalPossible = this.students().length * 18;
  //   return {
  //     totalStudents: this.students().length,
  //     present: present,
  //     absent: totalPossible - present,
  //     percentage:
  //       totalPossible > 0 ? ((present / totalPossible) * 100).toFixed(1) : '0',
  //   };
  // });
  ngOnInit() {
    this.loadClasses();
    this.loadSchedule();
    // Subjects are now static from WEEKLY_SCHEDULE, no need to load from API for selection
  }
  // Get the Monday of the current week
  getCurrentWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return this.formatDate(monday);
  }
  // Generate 6 consecutive dates starting from the selected week start
  generateWeekDates(startDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    for (let i = 0; i < 6; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(this.formatDate(date));
    }
    return dates;
  }
  // Format date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Navigate to previous week
  previousWeek() {
    const currentStart = new Date(this.selectedWeekStart());
    const day = (currentStart.getUTCDay() + 6) % 7;
    currentStart.setUTCDate(currentStart.getUTCDate() - day - 7);
    currentStart.setUTCHours(0, 0, 0, 0);
    this.selectedWeekStart.set(this.formatDate(currentStart));
    this.reloadAttendanceForNewWeek();
  }
  // Navigate to next week
  nextWeek() {
    const currentStart = new Date(this.selectedWeekStart());
    currentStart.setUTCHours(0, 0, 0, 0);
    const day = (currentStart.getUTCDay() + 6) % 7;
    currentStart.setUTCDate(currentStart.getUTCDate() - day + 7);
    this.selectedWeekStart.set(this.formatDate(currentStart));
    this.reloadAttendanceForNewWeek();
  }
  // Handle date input change
  onWeekStartChange(newDate: string) {
    this.selectedWeekStart.set(newDate);
    this.reloadAttendanceForNewWeek();
  }
  // Reload attendance data when week changes
  reloadAttendanceForNewWeek() {
    const classId = Number(this.selectedClassId());
    if (classId > 0) {
      this.onClassChange();
    }
  }

  // load schedule
  loadSchedule() {
    this.attendanceservice.getSchedule().subscribe({
      next: (res) => {
        this.weeklySchedule.set(res.data);
        console.log(this.weeklySchedule());
      },
      error: (err) => {
        console.error('Error get schedule');
      },
    });
  }

  loadClasses() {
    this.classservice.getAllClasses().subscribe({
      next: (res) => {
        this.classes.set(res.data);
      }
    });
  }

  onClassChange() {
    const classId = Number(this.selectedClassId());
    if (classId > 0) {
      this.loading.set(true);

      // this.studentservice
      //   .getStudentsByClassId(classId, '', '', '', 0)
      //   .subscribe({
      //     next: (res) => {
      //       this.students.set(res.data.data);
      //       this.loading.set(false);
      //     },
      //     error: (res) => {
      //       console.error('Error fetch student ', res.error);
      //     },
      //   });

      this.attendanceservice.getAttendanceReportByClass(this.selectedClassId(), this.selectedWeekStart()).subscribe({
        next: (res) => {
          this.studentAttendances.set(res.data);
          console.log(this.studentAttendances());
          this.loading.set(false);
        },
      });

      // Load existing attendance for this class (all subjects)
      this.loadExistingAttendance(classId);
      // this.students.set([
      //   {
      //     studentid: 1,
      //     studentname_kh: "មៀច សុខហៃ",
      //     studentname_eng : "Meach Sokhai",
      //     gender: "M",
      //     classid: 1,
      //     Class: {
      //       classname: "SV23"
      //     }
      //   },
      //   {
      //     studentid: 2,
      //     studentname_kh: "មៀច សុខហៃ",
      //     studentname_eng : "Meach Sokhai",
      //     gender: "M",
      //     classid: 1,
      //     Class: {
      //       classname: "SV23"
      //     }
      //   },
      //   {
      //     studentid: 3,
      //     studentname_kh: "មៀច សុខហៃ",
      //     studentname_eng : "Meach Sokhai",
      //     gender: "M",
      //     classid: 1,
      //     Class: {
      //       classname: "SV23"
      //     }
      //   },
      //   {
      //     studentid: 4,
      //     studentname_kh: "មៀច សុខហៃ",
      //     studentname_eng : "Meach Sokhai",
      //     gender: "M",
      //     classid: 1,
      //     Class: {
      //       classname: "SV23"
      //     }
      //   },
      // ]);
      // this.http
      //   .get<any[]>(`http://localhost:3000/api/students/class/${classId}`)
      //   .subscribe({
      //     next: (res) => {
      //       this.students.set(res);
      //       this.loading.set(false);
      //     },
      //     error: (err) => {
      //       console.error('Error loading students:', err);
      //       this.loading.set(false);
      //     },
      //   });
    }
  }

  loadExistingAttendance(classId: number) {
    // We want to load attendance for ALL subjects for this class
    // The service might need to support fetching without subjectId or we fetch specific subjects
    // For now, let's assume getAttendanceData can accept 0 or null for subjectId to get all
    // Or we iterate through the schedule. A better approach for the backend would be to allow fetching by classId only.
    // Since we updated the backend to allow optional subjectId, we can just pass classId.
    // Pass 0 or any dummy value if subjectId is optional in the service method signature but handled in backend
    // Checking service... Service expects subjectId. We might need to update service or pass 0.
    // Let's assume we update service or logic.
    // Based on previous step, getAllAttendance in backend handles optional subjectId.
    // But frontend service getAttendanceData takes subjectId as mandatory number?
    // Let's check service in a moment. For now, we will assume we can pass 0 to fetch all.
    const subjectId = 0; // Fetch all for class
    // this.attendanceService
    //   .getAttendanceData(classId, subjectId)
    //   .subscribe((res) => {
    //     const newMap = new Map();
    //     res.forEach((rec: Attendance) => {
    //       // Key now includes subjectId to distinguish slots
    //       newMap.set(
    //         `${rec.student_id}_${rec.attendance_date}_${rec.subject_id}`,
    //         rec.status,
    //       );
    //     });
    //     this.attendanceMap.set(newMap);
    //   });
  }
  toggleAttendance(
    index: number,
    status: number,
    studentId: number,
    subjectId: number,
  ) {
    status = status < 4 ? status + 1 : 0;
    const att = this.studentAttendances().find(
      (sa) => sa.student_id === studentId,
    )?.attendance[index];
    if (!att) return;
    att.status = status;
    this.attIndex = index;

    const existing = this.attendances.find(
      (a) => a.student_id === studentId && a.subject_id === subjectId,
    );
    if (existing) {
      existing.status = status;
    } else {
      this.attendances.push({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: 1,
        status: status,
      });
    }
  }
  saveAttendance() {
    this.fillBlankStatus();
    
    this.attendanceservice.createManyAttendances(this.attendances).subscribe({
      next: (res) => {
        this.onClassChange();
      } 
    })
  }

  // fill blank status
  fillBlankStatus() {
    const blankAtts = this.studentAttendances()
    .filter(s => s.attendance[this.attIndex].status === 0)
    .flatMap(sa => {
      const att = sa.attendance[this.attIndex];
      return {
        student_id: sa.student_id,
        subject_id: att.subject_id,
        teacher_id: 1,
        status: 2,
      }
    });

    blankAtts.forEach(b => {
      this.attendances.push(b);
    });
  }
  getSelectedClassName() {
    return (
      this.classes().find((c: any) => c.class_id == this.selectedClassId())
        ?.class_name || ''
    );
  }
  getSelectedTeacherName() {
    // return (
    //   this.classes().find((c: any) => c.classid == this.selectedClassId())
    //     ?.Teacher?.teachername_en || 'Unknown Teacher'
    // );
  }

  
  formatDateHeader(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${dayName} ${month}/${day}`;
  }

  async exportAttendance() {
    this.attendanceservice
    .downloadAttendance(this.selectedClassId())
    .subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'attendance-report.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}
