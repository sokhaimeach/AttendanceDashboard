import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Studentservice } from '../../services/student/studentservice';
import { Loading } from '../../shared/loading/loading';
import { Classservice } from '../../services/class/classservice';
import { StudentInterface } from '../../models/student.model';
import { ClassInterface } from '../../models/class.model';
import { TextLoading } from '../../shared/text-loading/text-loading';
import { ToastService } from '../../shared/toast/toast.service';
import { Toast } from '../../shared/toast/toast';
declare const bootstrap: any;

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading, TextLoading, Toast],
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

  // loading varaible
  loading = signal<boolean>(false);
  loadingExport = signal<boolean>(false);
  loadingSave = signal<boolean>(false);
  loadingImport = signal<boolean>(false);

  private studentModal: any;

  constructor(
    private studentservice: Studentservice,
    private classservice: Classservice,
    private toast: ToastService
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
  private loadStudentsByClass() {
    this.loading.set(true);
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
          this.loading.set(false);
          this.students.set(res.data.data);
          this.totalStudents = res.data.totalStudent;
          this.totalGirls = res.data.totalGirl;
          this.totalBoys = res.data.totalBoy;
          this.totalPages = Math.ceil(this.totalStudents / 15);
          this.pageStart = this.page;
          this.pageEnd = this.totalPages;
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error fetching students:', err);
        },
      });
  }

  // load all classes from backend (demo uses static data)
  loadClasses() {
    this.classservice.getAllClasses("").subscribe({
      next: (res) => {
        this.classes.set(res.data);
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

    this.loadingSave.set(true);

    this.studentservice.createStudent(this.form).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.loadingSave.set(false);
          this.toast.showToast(res.message, 'success');
          this.loadStudentsByClass();
        }, 2000);
      },
      error: (err) => {
        this.loadingSave.set(false);
        this.toast.showToast('Error create new student', 'danger');
      },
    });
  }

  // update student info

  // download student by class
  export() {
    this.loadingExport.set(true);
    this.studentservice
      .downloadStudentExcel(this.selectedClass)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'students.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
        this.loadingExport.set(false);
        this.toast.showToast("Download students list successfully", 'success');
      });
  }

  // ON FILTER CHANGE ACTIONS
  onClassChange() {
    this.clearPage();
    const className = this.classes()
    .find(c => c.class_id === Number(this.selectedClass))?.
    class_name;
    if(!className || this.selectedClass === 0) {
      this.toast.showToast(`Switched to show all students`, 'info');
    } else {
      this.toast.showToast(`Switched to class ${className}`, 'info');
    }
    this.loadStudentsByClass();
  }
  onGenderChange() {
    const toastMes = this.genderFilter === 'F'? 
    "Filter only female students" : this.genderFilter === "M"?
    "Filter only male students":"Remove gender filter";
    this.toast.showToast(toastMes, "info");
    this.loadStudentsByClass();
  }
  onSortChange(): void {
    const toastMes = this.sortOrder === 'ASC'? 
    "Filter sort students as accending" : this.sortOrder === "DESC"?
    "Filter sort students as descending":"Remove sort filter to default";
    this.toast.showToast(toastMes, "info");
    this.loadStudentsByClass();
  }

  // search students
  onSearch() {
    this.loadStudentsByClass();
  }

  // import students
  import(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.loadingImport.set(true);

    const file = input.files[0] as File;
    const formData = new FormData();
    formData.append('file', file);

    // API import file
    this.studentservice.importStudentByFile(formData).subscribe({
      next: (res) => {
        this.toast.showToast(`Add ${res.data.successCount} students to database`, "success");
        this.loadingImport.set(false);
      },
      error: (err) => {
        this.loadingImport.set(false);
        console.error(err.message);
      },
    });

    input.value = '';
  }

  // clear page before change class
  clearPage() {
    this.page = 1;
    this.pageSize = 10;
    this.totalPages = 0;
    this.pageStart = 0;
    this.pageEnd = 0;

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
    this.toast.showToast(`Viewing ${s.studentname_en}`, 'info');
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

    this.loadingSave.set(true);

    this.studentservice
      .updateStudentInfo(this.selectedStudent.student_id || 0, this.form)
      .subscribe({
        next: (res) => {
          this.loadingSave.set(false);
          this.loadStudentsByClass();
          this.toast.showToast('update student successfully', 'success');
        },
        error: (err) => {
          this.loadingSave.set(false);
          this.toast.showToast('Error updating student', 'danger');
        },
      });

    this.studentModal?.hide();
    this.lastUpdated = new Date().toLocaleString();
  }

  confrimDelete(s: StudentInterface) {
    if (!s.student_id) {
      this.toast.showToast('Student id is not found!', 'danger');
      return;
    }
    if (confirm(`Are you sure you want to delete ${s.studentname_en}?`)) {
      this.studentservice.deleteStudent(s.student_id).subscribe({
        next: (res) => {
          this.loadStudentsByClass();
          this.toast.showToast('delete student successfully', 'success');
        },
        error: (err) => {
          this.toast.showToast('Error updating student', 'danger');
        },
      });
    }
  }

  private initBootstrap() {
    const studentModalEl = document.getElementById('studentModal');

    if (studentModalEl) this.studentModal = new bootstrap.Modal(studentModalEl);
    
  }

  // turn number to percent
  percent(a: number, b: number): number {
    if (!a) return 0;
    return Math.round((a * 100 / b) * 100) / 100;
  }

}
