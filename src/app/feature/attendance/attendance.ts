import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

import { ClassInterface } from '../../models/class.model';
import {
  AttendanceReportInterface,
  CreateAttendanceInterface,
} from '../../models/attendance.model';

import { Classservice } from '../../services/class/classservice';
import { Attendanceservice } from '../../services/attendance/attendanceservice';
import { TextLoading } from '../../shared/text-loading/text-loading';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, TextLoading],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit, AfterViewInit {
  // services
  private readonly classService = inject(Classservice);
  private readonly attendanceService = inject(Attendanceservice);

  // state
  readonly classes = signal<ClassInterface[]>([]);
  readonly weeklySchedule = signal<any[]>([]);
  readonly studentAttendances = signal<AttendanceReportInterface[]>([]);
  readonly loading = signal<boolean>(false);

  readonly selectedClassId = signal<number>(0);
  readonly searchQuery = '';
  readonly selectedStatus = 0;

  // store week start as yyyy-mm-dd (same as <input type="date">)
  readonly selectedWeekStart = signal<string>(this.getCurrentWeekStart());

  // track changes to save
  private readonly TEACHER_ID = 1;
  attendances: CreateAttendanceInterface[] = [];
  private lastEditedIndex = -1;

  // derived
  readonly attendanceDates = computed(() =>
    this.generateWeekDates(this.selectedWeekStart()),
  );
  readonly todayStr = computed(() => this.formatDateLocal(new Date()));

  readonly selectedClassName = computed(() => {
    const cls = this.classes().find(
      (c) => c.class_id === this.selectedClassId(),
    );
    return cls?.class_name ?? '';
  });

  // you can wire this later from API / auth user
  readonly selectedTeacherName = computed(() => '—');

  // check all varaible
  isCheckAll: boolean = false;

  // Modal varaible
  @ViewChild('statusModal') statusModalEl!: ElementRef<HTMLElement>;
  statusModal?: Modal;

  // update variable
  selectUpdateAttendanceId: number = 0;
  updateAttendanceStatus: number = 0;

  // loading variable
  loadingExport = signal<boolean>(false);
  loadingSave = signal<boolean>(false);
  loadingUpdate = signal<boolean>(false);

  ngOnInit(): void {
    this.loadClasses();
    this.loadSchedule();
  }

  ngAfterViewInit() {
    // create modal instance once
    this.statusModal = new Modal(this.statusModalEl.nativeElement, {
      backdrop: 'static', // optional: prevent click outside close
      keyboard: true,
    });
  }

  // ---------------------------
  // Week helpers (local-safe)
  // ---------------------------

  private parseDateLocal(dateStr: string): Date {
    // avoid UTC shift for YYYY-MM-DD
    return new Date(`${dateStr}T00:00:00`);
  }

  private formatDateLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Monday of current week
  getCurrentWeekStart(): string {
    const today = new Date();
    const day = today.getDay(); // 0=Sun..6=Sat
    const diff = day === 0 ? -6 : 1 - day; // move to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return this.formatDateLocal(monday);
  }

  generateWeekDates(startDate: string): string[] {
    const start = this.parseDateLocal(startDate);
    const dates: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(this.formatDateLocal(d));
    }
    return dates;
  }

  previousWeek(): void {
    const current = this.parseDateLocal(this.selectedWeekStart());
    current.setDate(current.getDate() - 7);
    this.selectedWeekStart.set(this.formatDateLocal(current));
    this.reloadAttendanceForNewWeek();
  }

  nextWeek(): void {
    const current = this.parseDateLocal(this.selectedWeekStart());
    current.setDate(current.getDate() + 7);
    this.selectedWeekStart.set(this.formatDateLocal(current));
    this.reloadAttendanceForNewWeek();
  }

  onWeekStartChange(newDate: string): void {
    this.selectedWeekStart.set(newDate);
    this.reloadAttendanceForNewWeek();
  }

  jumpToCurrentWeek(): void {
    this.selectedWeekStart.set(this.getCurrentWeekStart());
    this.reloadAttendanceForNewWeek();
  }

  private reloadAttendanceForNewWeek(): void {
    if (this.selectedClassId() > 0) this.onClassChange();
  }

  // ---------------------------
  // API loads
  // ---------------------------

  private loadSchedule(): void {
    this.attendanceService.getSchedule().subscribe({
      next: (res) => this.weeklySchedule.set(res.data),
      error: () => console.error('Error get schedule'),
    });
  }

  private loadClasses(): void {
    this.classService.getAllClasses().subscribe({
      next: (res) => this.classes.set(res.data),
      error: () => console.error('Error load classes'),
    });

    this.selectedClassId.set(Number(sessionStorage.getItem('classId')) || 0);
    if (this.selectedClassId()) this.onClassChange();
  }

  onClassChange(): void {
    const classId = this.selectedClassId();
    if (!classId) return;

    sessionStorage.setItem('classId', String(this.selectedClassId()));

    this.loading.set(true);
    this.attendances = [];
    this.lastEditedIndex = -1;

    this.attendanceService
      .getAttendanceReportByClass(
        classId,
        this.selectedWeekStart(),
        this.searchQuery,
        this.selectedStatus,
      )
      .subscribe({
        next: (res) => {
          this.studentAttendances.set(res.data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          console.error('Error load attendance report');
        },
      });
  }

  // ---------------------------
  // Click rules (ONLY today)
  // ---------------------------

  isTodayDate(dateStr: string): boolean {
    return dateStr === this.todayStr();
  }

  private getDateFromCellIndex(cellIndex: number): string {
    // each day has 3 slots => 0..2 = day0, 3..5 = day1, ...
    const dayIndex = Math.floor(cellIndex / 3);
    return this.attendanceDates()[dayIndex] ?? '';
  }

  isCellDisabled(cellIndex: number, attendanceId: number): boolean {
    const cellDate = this.getDateFromCellIndex(cellIndex);

    // rule:
    // 1) disable if NOT today
    // 2) also disable if attendance already saved (attendance_id != 0) (same as your old logic)
    if (!this.isTodayDate(cellDate)) return true;
    if (attendanceId !== 0) return true;

    return false;
  }

  isToday() {
    const current = this.parseDateLocal(this.selectedWeekStart());
    const today = new Date();
    return (
      today.getDate() > current.getDate() &&
      today.getDate() < current.getDate() + 7
    );
  }

  // -------------------
  // Check all
  // -------------------

  allowCheckAll() {
    if (this.isCheckAll) {
      this.fillBlankStatus(1);

      const student = this.studentAttendances().map(
        (s) => s.attendance[this.lastEditedIndex],
      );

      student.forEach((s) => (s.status = 1));
    }
  }

  // ---------------------------
  // search
  search() {
    this.onClassChange();
  }

  // ---------------------------
  // Attendance edit/save (same logic)
  // ---------------------------

  toggleAttendance(
    index: number,
    status: number,
    studentId: number,
    subjectId: number,
  ): void {
    // cycle: 0 -> 1 -> 2 -> 3 -> 4
    const nextStatus = status < 4 ? status + 1 : 1;

    const student = this.studentAttendances().find(
      (s) => s.student_id === studentId,
    );
    const cell = student?.attendance[index];
    if (!cell) return;

    cell.status = nextStatus;
    this.lastEditedIndex = index;

    // keep your save payload logic: update if exists else push
    const existing = this.attendances.find(
      (a) => a.student_id === studentId && a.subject_id === subjectId,
    );

    if (existing) {
      existing.status = nextStatus;
    } else {
      this.attendances.push({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: this.TEACHER_ID,
        status: nextStatus,
      });
    }

    this.allowCheckAll();
  }

  saveAttendance(): void {
    this.fillBlankStatus(2);
    this.loadingSave.set(true);

    if (this.attendances.length === 0) return;

    this.attendanceService.createManyAttendances(this.attendances).subscribe({
      next: () => {
        this.loadingSave.set(false);
        this.onClassChange();
      },
      error: () => console.error('Error save attendance'),
    });
  }

  // same idea as your old code, but safer + avoids pushing duplicates
  private fillBlankStatus(status: number): void {
    if (this.lastEditedIndex < 0) return;

    const colIndex = this.lastEditedIndex;

    const blankRows = this.studentAttendances()
      .filter((s) => (s.attendance[colIndex]?.status ?? 0) === 0)
      .map((s) => {
        const cell = s.attendance[colIndex];
        return {
          student_id: s.student_id,
          subject_id: cell.subject_id,
          teacher_id: this.TEACHER_ID,
          status: status, // absent
        } as CreateAttendanceInterface;
      });

    for (const b of blankRows) {
      const exists = this.attendances.some(
        (a) => a.student_id === b.student_id && a.subject_id === b.subject_id,
      );
      if (!exists) this.attendances.push(b);
    }
  }

  // ---------------------------
  // Export
  // ---------------------------

  exportAttendance(): void {
    if (!this.selectedClassId()) return;

    this.loadingExport.set(true);

    this.attendanceService
      .downloadAttendance(this.selectedClassId())
      .subscribe((blob) => {
        this.loadingExport.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance-report.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // ---------------
  // Modal
  // ---------------
  isAllowUpdate(attendanceId: number, cellIndex: number): boolean {
    const cellDate = this.getDateFromCellIndex(cellIndex);

    return this.isTodayDate(cellDate) && attendanceId ? true : false;
  }

  openUpdateModal(attendanceId: number, status: number) {
    this.selectUpdateAttendanceId = attendanceId;
    this.updateAttendanceStatus = status;
    this.statusModal?.show();
  }

  closeUpdateModal() {
    this.statusModal?.hide();
  }

  pickStatus(status: number) {
    this.updateAttendanceStatus = status;
  }

  updateAttendance() {
    if (!this.updateAttendanceStatus) return;
    this.loadingUpdate.set(true);

    this.attendanceService
      .updateAttendanceStatus(
        this.selectUpdateAttendanceId,
        this.updateAttendanceStatus,
      )
      .subscribe({
        next: (res) => {
          this.onClassChange();
          this.loadingUpdate.set(false);
          this.closeUpdateModal();
        },
        error: (err) => {
          this.loadingUpdate.set(false);
          console.error('error update attendance ', err.error);
        }
      });
  }
}
