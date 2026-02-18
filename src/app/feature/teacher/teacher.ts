import { Component, inject, OnInit, signal } from '@angular/core';
import { TeacherService } from '../../services/teacher/teacher.service';
import { TeacherInterface } from '../../models/teacher.model';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/toast/toast.service';
import { Toast } from '../../shared/toast/toast';
import { FormsModule } from '@angular/forms';
import { Loading } from '../../shared/loading/loading';
import { TextLoading } from '../../shared/text-loading/text-loading';

@Component({
  selector: 'app-teacher',
  imports: [CommonModule, Toast, FormsModule, Loading, TextLoading],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css',
})
export class Teacher implements OnInit {
  // inject all service
  private readonly teacherService = inject(TeacherService);
  private readonly toastService = inject(ToastService);

  // teacher varaible
  teachers = signal<TeacherInterface[]>([]);
  searchText: string = '';
  selectRole: string = '';
  selectStatus: string = '';
  form: TeacherInterface = {
    teachername_kh: '',
    teachername_en: '',
    role: 'teacher',
    phone: '',
    is_active: true,
    password: '',
  };
  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;
  
  // update teacher variable
  selectedTeacher: TeacherInterface | null = null;
  selectedTeacherId: number = 0;
  isEdit = false;

  // report
  totalTeacher = signal<number>(0);
  totalTeacherRole = signal<number>(0);
  totalAdminRole = signal<number>(0);
  totalActive = signal<number>(0);

  // pagination
  page = 1;
  pageSize = 15;
  totalPages = 0;

  // loading varaible
  loading = signal<boolean>(false);
  loadingModal = signal<boolean>(false);

  // toggle password variable
  showPassword = signal<boolean>(false);
  eyeIcon = signal<string>('bi-eye-slash');

  // implements onInit
  ngOnInit(): void {
    this.loadAllTachers();
    this.loadTeacherReport();
  }

  // ###########################
  // API (Get data from backend)
  // ###########################
  private loadAllTachers() {
    this.loading.set(true);
    this.teacherService
      .getAllTeacher(
        this.searchText,
        this.selectRole,
        this.selectStatus,
        this.page,
        this.pageSize,
      )
      .subscribe({
        next: (res) => {
          this.teachers.set(res.data.data);
          this.totalPages = res.data.totalPages;
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.teachers.set(err.error.data);
          console.error(err.error.message);
        },
      });
  }

  // load teacher report
  private loadTeacherReport() {
    this.teacherService.getTeacherReport().subscribe({
      next: (res) => {
        this.totalTeacher.set(res.data.totalTeacher);
        this.totalTeacherRole.set(res.data.totalTeacherRole);
        this.totalAdminRole.set(res.data.totalAdminRole);
        this.totalActive.set(res.data.totalActive);
      },
    });
  }

  // #########################
  // FILTER
  // #########################
  onSearch() {
    this.loadAllTachers();
  }

  onRoleChange() {
    const toastMes =
      this.selectRole === 'teacher'
        ? 'Filter only teachers'
        : this.selectRole === 'admin'
          ? 'Filter only admins'
          : 'Remove filter by role';
    this.toastService.showToast(toastMes, 'info');
    this.loadAllTachers();
  }

  onStatusChange() {
    const toastMes =
      this.selectStatus === 'true'
        ? 'Filter only active accounts'
        : this.selectStatus === 'false'
          ? 'Filter only inactive accounts'
          : 'Remove filter by status';
    this.toastService.showToast(toastMes, 'info');
    this.loadAllTachers();
  }

  // pagination
  onPrevPage() {
    this.page = this.page > 1 ? this.page - 1 : 1;
    this.loadAllTachers();
  }

  onNextPage() {
    this.page = this.page < this.totalPages ? this.page + 1 : this.totalPages;
    this.loadAllTachers();
  }

  // helper function
  toPercent(a: number, b: number): number {
    return Math.round(((a * 100) / b) * 100) / 100;
  }

  // toggle password
  togglePassword() {
    this.showPassword.set(!this.showPassword());
    this.eyeIcon.set(this.showPassword() ? 'bi-eye' : 'bi-eye-slash');
  }

  // ##########################
  // FORM CREATE & UPDATE
  // ##########################

  // submit form create or update teacher
  onSubmit() {
    if (!this.form.password) {
      this.toastService.showToast('Password is required', 'danger');
      return;
    }
    this.loadingModal.set(true);

    this.teacherService.createTeacher(this.createFormData()).subscribe({
      next: (res) => {
        this.toastService.showToast(res.message, 'success');
        this.loadAllTachers();
        this.loadTeacherReport();
        this.clearForm();
        this.loadingModal.set(false);
      },
      error: (err) => {
        this.loadingModal.set(false);
        this.toastService.showToast(err.error.message, 'danger');
        console.error(err.error.message);
      }
    });
  }

  private createFormData(): FormData {
    const formData = new FormData();
    formData.append('teachername_kh', this.form.teachername_kh);
    formData.append('teachername_en', this.form.teachername_en);
    formData.append('role', this.form.role);
    formData.append('phone', this.form.phone);
    formData.append('is_active', this.form.is_active.toString());
    formData.append('password', this.form.password || '');
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    return formData;
  }

  // upload image
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.onRemoveFile();

    const file = input.files[0] as File;
    this.selectedFile = file;

    if (this.selectedFile) {
      this.imagePreview = URL.createObjectURL(this.selectedFile);
    }
  }

  onRemoveFile() {
    this.selectedFile = null as any;
    this.imagePreview = null;
  }

  onSelectStatusChange() {
    this.form.is_active = !this.form.is_active;
  }

  clearForm() {
    this.form = {
      teachername_kh: '',
      teachername_en: '',
      role: 'teacher',
      phone: '',
      is_active: true,
      password: '',
    };
    this.onRemoveFile();
    this.isEdit = false;
  }

  // Update teacher
  openEditModal(t: TeacherInterface) {
    this.isEdit = true;
    this.selectedTeacherId = t.teacher_id || 0;
    this.selectedTeacher = t;
    this.form = {
      teachername_kh: t.teachername_kh,
      teachername_en: t.teachername_en,
      role: t.role,
      phone: t.phone,
      is_active: t.is_active,
      password: '',
    };
    this.imagePreview = t.image_url || null;
  }

  onUpdate() {
    this.loadingModal.set(true);

    this.teacherService.updateTeacher(this.selectedTeacherId, this.createFormData()).subscribe({
      next: (res) => {
        this.toastService.showToast(res.message, 'success');
        this.loadAllTachers();
        this.loadTeacherReport();
        this.clearForm();
        this.loadingModal.set(false);
      },
      error: (err) => {
        this.loadingModal.set(false);
        this.toastService.showToast(err.error.message, 'danger');
        console.error(err.error.message);
      }
    });
  }
}
