import { Component, OnInit, signal, computed, inject } from '@angular/core';

 interface Attendances {
  id?: number;
  student_id: number;
  class_id: number;
  subject_id: number;
  attendance_date: string; // Format: 'YYYY-MM-DD'
  status: 'present' | 'absent';
  teacher_id?: number;
  // Helper fields for UI
  studentname_kh?: string;
  studentname_eng?: string;
}
 interface Class {
    classid?: number;
    classname: string;
    room: string;
    teacherid?: number;
}

 interface Student {
  studentid?: number;
  studentname_kh: string;
  studentname_eng : string;
  gender: string;
  classid: number;
  Class?: {
    classname: string;
  };
}

 interface StudentResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  students: Student[];
}
 interface Subject {
    subjectid?: number;
    subjectname: string;
    description: string;
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

 interface TeacherResponse {
  teachers: Teacher[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

@Component({
  selector: 'app-attendance',
  imports: [],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  // private attendanceService = inject(AttendanceService);
  // private subjectService = inject(SubjectService);
  // private http = inject(HttpClient);
  classes = signal<any[]>([]);
  students = signal<any[]>([]);
  WEEKLY_SCHEDULE = [
  {
    day: 'Monday',
    slots: [
      { id: 11, name: 'SM II' },
      { id: 10, name: '2D' },
      { id: 14, name: 'Oracle' },
    ],
  },
  {
    day: 'Tuesday',
    slots: [
      { id: 17, name: 'IS' },
      { id: 13, name: 'WBD' },
      { id: 12, name: 'Java' },
    ],
  },
  {
    day: 'Wednesday',
    slots: [
      { id: 14, name: 'Oracle' },
      { id: 15, name: 'SA' },
      { id: 11, name: 'SM II' },
    ],
  },
  {
    day: 'Thursday',
    slots: [
      { id: 13, name: 'WBD' },
      { id: 15, name: 'SA' },
      { id: 16, name: 'MIS' },
    ],
  },
  {
    day: 'Friday',
    slots: [
      { id: 16, name: 'MIS' },
      { id: 17, name: 'IS' },
      { id: 18, name: 'Networking III' },
    ],
  },
  {
    day: 'Saturday',
    slots: [
      { id: 18, name: 'Networking III' },
      { id: 12, name: 'Java' },
      { id: 10, name: '2D' },
    ],
  },
];
  // Weekly Schedule Data
  // weeklySchedule = WEEKLY_SCHEDULE;
  // Week selection
  selectedWeekStart = signal<string>(this.getCurrentWeekStart());
  attendanceDates = computed(() =>
    this.generateWeekDates(this.selectedWeekStart()),
  );
  selectedClassId = signal<number>(0);
  // Removed selectedSubjectId as we now show all subjects
  loading = signal<boolean>(false);
  // Key format: `${studentId}_${date}_${subjectId}`
  attendanceMap = signal<Map<string, string>>(new Map());
  attendanceStats = computed(() => {
    const map = this.attendanceMap();
    let present = 0;
    map.forEach((status: string) => {
      if (status === 'present') present++;
    });
    // Calculate total possible slots based on schedule (6 days * 3 slots = 18 slots per student)
    const totalPossible = this.students().length * 18;
    return {
      totalStudents: this.students().length,
      present: present,
      absent: totalPossible - present,
      percentage:
        totalPossible > 0 ? ((present / totalPossible) * 100).toFixed(1) : '0',
    };
  });
  ngOnInit() {
    // this.loadClasses();
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
    currentStart.setDate(currentStart.getDate() - 7);
    this.selectedWeekStart.set(this.formatDate(currentStart));
    this.reloadAttendanceForNewWeek();
  }
  // Navigate to next week
  nextWeek() {
    const currentStart = new Date(this.selectedWeekStart());
    currentStart.setDate(currentStart.getDate() + 7);
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
      // this.loadExistingAttendance(classId);
    }
  }
  // loadClasses() {
  //   console.log('Fetching classes from:', 'http://localhost:3000/api/classes');
  //   this.http.get<any[]>('http://localhost:3000/api/classes').subscribe({
  //     next: (res: any) => {
  //       const finalData = Array.isArray(res)
  //         ? res
  //         : res.data || res.classes || [];
  //       this.classes.set(finalData);
  //     },
  //     error: (err) => {
  //       console.error('HTTP Error:', err);
  //       alert(
  //         'Could not connect to API. Check if your Node.js server is running on port 3000.',
  //       );
  //     },
  //   });
  // }
  // onClassChange() {
  //   const classId = Number(this.selectedClassId());
  //   if (classId > 0) {
  //     this.loading.set(true);
  //     // Load existing attendance for this class (all subjects)
  //     this.loadExistingAttendance(classId);
  //     this.http
  //       .get<any[]>(`http://localhost:3000/api/students/class/${classId}`)
  //       .subscribe({
  //         next: (res) => {
  //           this.students.set(res);
  //           this.loading.set(false);
  //         },
  //         error: (err) => {
  //           console.error('Error loading students:', err);
  //           this.loading.set(false);
  //         },
  //       });
  //   }
  // }
  // loadExistingAttendance(classId: number) {
  //   // We want to load attendance for ALL subjects for this class
  //   // The service might need to support fetching without subjectId or we fetch specific subjects
  //   // For now, let's assume getAttendanceData can accept 0 or null for subjectId to get all
  //   // Or we iterate through the schedule. A better approach for the backend would be to allow fetching by classId only.
  //   // Since we updated the backend to allow optional subjectId, we can just pass classId.
  //   // Pass 0 or any dummy value if subjectId is optional in the service method signature but handled in backend
  //   // Checking service... Service expects subjectId. We might need to update service or pass 0.
  //   // Let's assume we update service or logic.
  //   // Based on previous step, getAllAttendance in backend handles optional subjectId.
  //   // But frontend service getAttendanceData takes subjectId as mandatory number?
  //   // Let's check service in a moment. For now, we will assume we can pass 0 to fetch all.
  //   const subjectId = 0; // Fetch all for class
  //   this.attendanceService
  //     .getAttendanceData(classId, subjectId)
  //     .subscribe((res) => {
  //       const newMap = new Map();
  //       res.forEach((rec: Attendance) => {
  //         // Key now includes subjectId to distinguish slots
  //         newMap.set(
  //           `${rec.student_id}_${rec.attendance_date}_${rec.subject_id}`,
  //           rec.status,
  //         );
  //       });
  //       this.attendanceMap.set(newMap);
  //     });
  // }
  // toggleAttendance(studentId: number, date: string, subjectId: number) {
  //   const key = `${studentId}_${date}_${subjectId}`;
  //   const current = this.getAttendanceStatus(studentId, date, subjectId);
  //   const newMap = new Map(this.attendanceMap());
  //   if (current === 'none') newMap.set(key, 'present');
  //   else if (current === 'present') newMap.set(key, 'absent');
  //   else newMap.delete(key);
  //   this.attendanceMap.set(newMap);
  // }
  // saveAttendance() {
  //   const records: Attendance[] = [];
  //   const currentClass = this.classes().find(
  //     (c: any) => c.classid == this.selectedClassId(),
  //   );
  //   const teacherId = currentClass ? currentClass.teacherid : undefined;

  //   this.attendanceMap().forEach((status, key) => {
  //     const parts = key.split('_');
  //     // Format: studentId_date_subjectId
  //     if (parts.length === 3) {
  //       const [student_id, attendance_date, subject_id] = parts;
  //       records.push({
  //         student_id: parseInt(student_id),
  //         class_id: this.selectedClassId(),
  //         subject_id: parseInt(subject_id),
  //         attendance_date: attendance_date,
  //         status: status as 'present' | 'absent',
  //         teacher_id: teacherId,
  //       });
  //     }
  //   });

  //   if (records.length === 0) {
  //     alert('No attendance data available to save.');
  //     return;
  //   }

  //   this.attendanceService
  //     .submitDailyAttendance(records)
  //     .subscribe(() => alert('Attendance Saved!'));
  // }
  // getAttendanceStatus(
  //   studentId: number,
  //   date: string,
  //   subjectId: number,
  // ): string {
  //   return (
  //     this.attendanceMap().get(`${studentId}_${date}_${subjectId}`) || 'none'
  //   );
  // }
  // getPresentCount(studentId: number): number {
  //   let count = 0;
  //   // Iterate over all dates and all slots in schedule
  //   this.attendanceDates().forEach((date, index) => {
  //     // Get schedule for this day (index corresponds to Mon-Sat)
  //     // Note: WEEKLY_SCHEDULE is 0-5 (Mon-Sat). attendanceDates are also 6 days.
  //     if (index < this.weeklySchedule.length) {
  //       const dailySchedule = this.weeklySchedule[index];
  //       dailySchedule.slots.forEach((slot) => {
  //         if (
  //           this.getAttendanceStatus(studentId, date, slot.id) === 'present'
  //         ) {
  //           count++;
  //         }
  //       });
  //     }
  //   });
  //   return count;
  // }
  // getSelectedClassName() {
  //   return (
  //     this.classes().find((c: any) => c.classid == this.selectedClassId())
  //       ?.classname || ''
  //   );
  // }
  // getSelectedTeacherName() {
  //   return (
  //     this.classes().find((c: any) => c.classid == this.selectedClassId())
  //       ?.Teacher?.teachername_en || 'Unknown Teacher'
  //   );
  // }
  // // Format date for table header (e.g., "Mon 05/01")
  // formatDateHeader(dateStr: string): string {
  //   const date = new Date(dateStr);
  //   const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  //   const dayName = days[date.getDay()];
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${dayName} ${month}/${day}`;
  // }
  // async exportAttendance() {
  //   if (this.students().length === 0) {
  //     alert('No data to export. Please select a class first.');
  //     return;
  //   }
  //   const className = this.getSelectedClassName();
  //   // Create a temporary canvas to render Khmer text
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) {
  //     alert('Canvas not supported');
  //     return;
  //   }
  //   const doc = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'mm',
  //     format: 'a4',
  //   });
  //   // Add title
  //   doc.setFontSize(18);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('Weekly Attendance Report', 148, 15, { align: 'center' });
  //   // Add class and teacher info
  //   doc.setFontSize(11);
  //   doc.setFont('helvetica', 'normal');
  //   doc.text(`Class: ${className}`, 14, 25);
  //   doc.text(`Teacher: ${this.getSelectedTeacherName()}`, 14, 31);
  //   doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);
  //   // Prepare table data
  //   const tableData: any[] = [];
  //   // Headers: No | Name | Sex | Mo | | | Tu | | | ... | Total
  //   // We need 2 header rows because we have 3 subjects per day.
  //   // Row 1: Days
  //   // Row 2: Subjects
  //   this.students().forEach((student, index) => {
  //     const row: any[] = [index + 1, student.studentname_eng, student.gender];
  //     // Iterate through each day in the schedule
  //     this.attendanceDates().forEach((date, i) => {
  //       if (i < this.weeklySchedule.length) {
  //         const daily = this.weeklySchedule[i];
  //         // Add status for each slot (subject) in that day
  //         daily.slots.forEach((slot) => {
  //           const status = this.getAttendanceStatus(
  //             student.studentid,
  //             date,
  //             slot.id,
  //           );
  //           row.push(
  //             status === 'present' ? 'P' : status === 'absent' ? 'A' : '-',
  //           );
  //         });
  //       }
  //     });
  //     // Add total present count
  //     row.push(this.getPresentCount(student.studentid).toString());
  //     tableData.push(row);
  //   });
  //   // Prepare headers
  //   // Top header: Days
  //   const topHeader: any[] = [
  //     { content: 'No', rowSpan: 2, styles: { halign: 'center' } },
  //     { content: 'Student Name', rowSpan: 2, styles: { halign: 'center' } },
  //     { content: 'Sex', rowSpan: 2, styles: { halign: 'center' } },
  //   ];
  //   // Sub header: Subjects
  //   const subHeader: any[] = [];
  //   this.weeklySchedule.forEach((day) => {
  //     topHeader.push({
  //       content: day.day,
  //       colSpan: 3,
  //       styles: { halign: 'center' },
  //     });
  //     day.slots.forEach((slot) => {
  //       subHeader.push({
  //         content: slot.name,
  //         styles: { fontSize: 7, halign: 'center' },
  //       });
  //     });
  //   });
  //   topHeader.push({
  //     content: 'Total',
  //     rowSpan: 2,
  //     styles: { halign: 'center', fontStyle: 'bold' },
  //   } as any);
  //   // Generate table
  //   autoTable(doc, {
  //     head: [topHeader, subHeader],
  //     body: tableData,
  //     startY: 43,
  //     theme: 'grid',
  //     styles: {
  //       fontSize: 8,
  //       cellPadding: 2,
  //       lineColor: [200, 200, 200],
  //       lineWidth: 0.1,
  //     },
  //     headStyles: {
  //       fillColor: [41, 128, 185],
  //       textColor: 255,
  //       fontStyle: 'bold',
  //       halign: 'center',
  //       fontSize: 9,
  //       valign: 'middle',
  //     },
  //     columnStyles: {
  //       0: { cellWidth: 10, halign: 'center' },
  //       1: { cellWidth: 40, halign: 'left' },
  //       2: { cellWidth: 10, halign: 'center' },
  //     },
  //     didDrawCell: (data: any) => {
  //       // Color code attendance marks
  //       // Columns > 2 are attendance data
  //       if (
  //         data.section === 'body' &&
  //         data.column.index > 2 &&
  //         data.column.index < 3 + 18 // 3 fixed cols + 18 slots
  //       ) {
  //         const value = data.cell.text[0];
  //         if (value === 'P') {
  //           doc.setTextColor(39, 174, 96); // Green
  //         } else if (value === 'A') {
  //           doc.setTextColor(231, 76, 60); // Red
  //         }
  //       }
  //     },
  //     didDrawPage: (data: any) => {
  //       doc.setTextColor(0, 0, 0);
  //       const pageCount = (doc as any).internal.getNumberOfPages();
  //       doc.setFontSize(8);
  //       doc.text(
  //         `Page ${data.pageNumber} of ${pageCount}`,
  //         doc.internal.pageSize.getWidth() / 2,
  //         doc.internal.pageSize.getHeight() - 10,
  //         { align: 'center' },
  //       );
  //     },
  //   });
  //   const fileName = `Attendance_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  //   doc.save(fileName);
  // }
}




