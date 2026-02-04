import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Studentservice } from '../../services/student/studentservice';
import { Loading } from '../../shared/loading/loading';
import { Classservice } from '../../services/class/classservice';
import { StudentInterface } from '../../models/student.model';
import { ClassInterface } from '../../models/class.model';
declare const bootstrap: any;

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit {
  // classes
  classes = signal<ClassInterface[]>([]);
  selectedClass: number = 0; // user choice
  classError = '';

  private classModal: any;

  students = signal<StudentInterface[]>([]);

  // filters
  searchText: string = '';
  genderFilter: string = '';
  sortOrder: '' | 'ASC' | 'DESC' = '';

  // pagination
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageStart = 0;
  pageEnd = 0;

  // stats
  totalStudents = 0;
  totalGirls = 0;
  totalBoys = 0;

  lastUpdated = new Date().toLocaleString();

  // modals
  isEdit = false;
  selectedStudent: StudentInterface | null = null;
  modalError = '';

  form: StudentInterface = {
    studentname_en: '',
    studentname_kh: '',
    gender: 'M',
    class_id: this.selectedClass,
  };

  // toast
  toastMessage = '';
  toastIcon = 'bi-check-circle-fill text-success';

  private studentModal: any;
  private toast: any;

  constructor(
    private studentservice: Studentservice,
    private classservice: Classservice,
  ) {}

  ngOnInit() {
    this.loadClasses();
    this.loadStudentsByClass();
    this.initBootstrap();
  }

  confirmClass() {
    if (!this.selectedClass) {
      this.classError = 'Please select a class first.';
      return;
    }

    this.classError = '';
    sessionStorage.setItem('selectedClass', String(this.selectedClass));
    this.form.class_id = this.selectedClass;

    this.loadStudentsByClass();

    this.classModal?.hide();
  }

  // get all student by class from backend (demo uses static data)
  loadStudentsByClass() {
    this.studentservice
      .getStudentsByClassId(
        this.selectedClass,
        this.genderFilter,
        this.searchText,
        this.sortOrder,
        this.page
      )
      .subscribe({
        next: (res) => {
          this.students.set(res.data.data);
          this.totalStudents = res.data.totalStudent;
          this.totalGirls = res.data.totalGirl;
          this.totalBoys = res.data.totalBoy;
          this.totalPages = Math.ceil(this.totalStudents / 15);
          // console.log('Fetched students:', this.students());
        },
        error: (err) => {
          console.error('Error fetching students:', err);
        },
      });
  }

  // load all classes from backend (demo uses static data)
  loadClasses() {
    this.classservice.getAllClasses().subscribe({
      next: (res) => {
        this.classes.set(res.data);
        console.log('Fetched classes:', this.classes());
      },
      error: (err) => {
        console.error('Error fetching classes:', err);
      },
    });
  }

  // create new Student
  createNewStudent() {
    // validation
    if (
      !this.form.studentname_en.trim() ||
      !this.form.studentname_kh.trim() ||
      !this.form.class_id
    ) {
      this.modalError = 'Please fill all fields.';
      return;
    }

    this.studentservice.createStudent(this.form).subscribe({
      next: (res) => {
        this.showToast(res.message, 'success');
        this.loadStudentsByClass();
      },
      error: (err) => {
        this.showToast('Error create new student', 'danger');
      },
    });
  }

  // update student info

  // download student by class
  export() {
    this.studentservice
      .downloadStudentExcel(this.selectedClass)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'students.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
      });
  }

  onClassChange() {
    this.showToast(`Switched to class ${this.selectedClass}`, 'info');
    sessionStorage.setItem('selectedClass', String(this.selectedClass));
    this.loadStudentsByClass();
  }

  import(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const file = input.files[0] as File;
    const formData = new FormData();
    formData.append('file', file);

    console.log(typeof formData, formData);

    // API import file
    this.studentservice.importStudentByFile(formData).subscribe({
      next: (res) => {
        console.log(res);
        this.showToast(`Add ${res.data.successCount}`, "success");
      },
      error: (err) => {
        console.error(err.message);
      },
    });

    input.value = '';
  }

  private updatePagination() {
    // const total = this.filteredStudents.length;
    // this.totalPages = Math.ceil(total / this.pageSize);
    // const startIndex = (this.page - 1) * this.pageSize;
    // const endIndex = startIndex + this.pageSize;
    // this.pagedStudents = this.filteredStudents.slice(startIndex, endIndex);
    // this.pageStart = total === 0 ? 0 : startIndex + 1;
    // this.pageEnd = Math.min(endIndex, total);
  }

  prevPage() {
    if(this.page > 1) {
      this.page--;
      this.loadStudentsByClass();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadStudentsByClass();
    }
  }

  // ========= CRUD UI =========
  viewStudent(s: StudentInterface) {
    this.showToast(`Viewing ${s.studentname_en}`, 'info');
  }

  openCreateModal() {
    this.isEdit = false;
    this.modalError = '';
    this.form = {
      student_id: 0,
      studentname_en: '',
      studentname_kh: '',
      gender: 'M',
      class_id: this.selectedClass,
    };
    this.studentModal?.show();
  }

  openEditModal(s: StudentInterface) {
    this.isEdit = true;
    this.modalError = '';
    this.selectedStudent = s;
    this.form = { ...s };
    console.log(this.form);
    this.studentModal?.show();
  }

  saveStudent() {
    // validation
    if (
      !this.form.studentname_en.trim() ||
      !this.form.studentname_kh.trim() ||
      !this.form.class_id
    ) {
      this.modalError = 'Please fill all fields.';
      return;
    }
    if (!this.selectedStudent) {
      this.modalError = 'no select student found';
      return;
    }

    this.studentservice
      .updateStudentInfo(this.selectedStudent.student_id || 0, this.form)
      .subscribe({
        next: (res) => {
          this.loadStudentsByClass();
          this.showToast('update student successfully', 'success');
        },
        error: (err) => {
          this.showToast('Error updating student', 'danger');
        },
      });

    this.studentModal?.hide();
    this.lastUpdated = new Date().toLocaleString();
  }

  confrimDelete(s: StudentInterface) {
    if (!s.student_id) {
      this.showToast('Student id is not found!', 'danger');
      return;
    }
    if (confirm(`Are you sure you want to delete ${s.studentname_en}?`)) {
      this.studentservice.deleteStudent(s.student_id).subscribe({
        next: (res) => {
          this.loadStudentsByClass();
          this.showToast('delete student successfully', 'success');
        },
        error: (err) => {
          this.showToast('Error updating student', 'danger');
        },
      });
    }
  }

  private initBootstrap() {
    const studentModalEl = document.getElementById('studentModal');
    const deleteModalEl = document.getElementById('deleteModal');
    const toastEl = document.getElementById('appToast');

    if (studentModalEl) this.studentModal = new bootstrap.Modal(studentModalEl);
    // if (deleteModalEl) this.deleteModal = new bootstrap.Modal(deleteModalEl);
    if (toastEl) this.toast = new bootstrap.Toast(toastEl, { delay: 2000 });
  }

  // ========= header actions =========
  refresh() {
    this.lastUpdated = new Date().toLocaleString();
    this.loadStudentsByClass();
    this.showToast('Refreshed successfully', 'success');
  }

  // ========= Toast =========
  private showToast(msg: string, type: 'success' | 'danger' | 'info') {
    this.toastMessage = msg;

    if (type === 'success')
      this.toastIcon = 'bi-check-circle-fill text-success';
    if (type === 'danger') this.toastIcon = 'bi-x-circle-fill text-danger';
    if (type === 'info') this.toastIcon = 'bi-info-circle-fill text-primary';

    this.toast?.show();
  }
}
