import { Component, inject, OnInit, signal } from '@angular/core';
import { TeacherInterface } from '../../models/teacher.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { ToastService } from '../../shared/toast/toast.service';
import { TeacherService } from '../../services/teacher/teacher.service';
import { TextLoading } from '../../shared/text-loading/text-loading';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule, Toast, TextLoading],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  // services
  protected readonly teacherService = inject(TeacherService);
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);

  // variables
  teacher = signal<TeacherInterface | any>({
    teacher_id: 0,
    teachername_en: '',
    teachername_kh: '',
    phone: '',
    role: 'teacher',
    is_active: true,
  });
  currentUserRole: 'teacher' | 'admin' = 'teacher';

  // image variable
  selectedImageFile: File | null = null;
  previewImage: string | null = null;

  // change password variable
  form = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  };
  showOldPass: boolean = false;
  showNewPass: boolean = false;
  showConfirmPass: boolean = false;
  showResetPass: boolean = false;

  resetPass: string = '';

  // loading variable
  loadingEditImage = signal<boolean>(false);
  loadingUpdateStatus = signal<boolean>(false);
  loadingResetPassword = signal<boolean>(false);
  loadingChangePassword = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTeacherInfo();
  }

  // API calls
  loadTeacherInfo() {
    this.teacherService.getTeacherById(1).subscribe({
      next: (res) => {
        this.teacher.set(res.data);
        this.currentUserRole = this.teacher().role;
        console.log('Fetched teacher info:', this.teacher());
      },
      error: (err) => {
        console.error('Error fetching teacher info:', err);
      },
    });
  }

  // admin function
  toggleActive() {
    this.loadingUpdateStatus.set(true);
    this.teacherService
      .updateTeacherStatus(this.teacher().teacher_id, !this.teacher().is_active)
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.loadTeacherInfo();
            this.toastService.showToast(res.message, 'success');
            this.loadingUpdateStatus.set(false);
          }, 1000);
        },
        error: (err) => {
          this.loadingUpdateStatus.set(false);
          console.error('Error updating teacher status:', err);
          this.toastService.showToast(err.error.message, 'danger');
        },
      });
  }

  resetPassword() {
    if (!this.resetPass.trim()) {
      this.toastService.showToast('Please enter a new password', 'info');
      return;
    }

    this.loadingResetPassword.set(true);
    this.authService
      .resetPassword(this.teacher().teacher_id, this.resetPass)
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.toastService.showToast(res.message, 'success');
            this.resetPass = '';
            this.showResetPass = false;
            this.loadingResetPassword.set(false);
          }, 1000);
        },
        error: (err) => {
          this.loadingResetPassword.set(false);
          console.error('Error resetting password:', err);
          this.toastService.showToast(err.error.message, 'danger');
        },
      });
  }

  // teacher function
  changePassword() {
    if (
      !this.form.old_password.trim() ||
      !this.form.new_password.trim() ||
      !this.form.confirm_password.trim()
    ) {
      this.toastService.showToast('Please fill all fields', 'info');
      return;
    }

    if (this.form.new_password !== this.form.confirm_password) {
      this.toastService.showToast(
        'New password and confirm password do not match',
        'info',
      );
      return;
    }

    this.loadingChangePassword.set(true);
    this.authService
      .changePassword(
        this.teacher().teacher_id,
        this.form.old_password,
        this.form.new_password,
      )
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.toastService.showToast(res.message, 'success');
            this.form.old_password = '';
            this.form.new_password = '';
            this.form.confirm_password = '';
            this.showOldPass = false;
            this.showNewPass = false;
            this.showConfirmPass = false;
            this.loadingChangePassword.set(false);
          }, 1000);
        },
        error: (err) => {
          this.loadingChangePassword.set(false);
          console.error('Error changing password:', err);
          this.toastService.showToast(err.error.message, 'danger');
        },
      });
  }

  // profile function
  onSelectImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.toastService.showToast('No file selected', 'info');
      return;
    }

    const file = input.files[0];
    this.selectedImageFile = file;
    this.previewImage = URL.createObjectURL(file);
  }
  clearImage() {
    this.selectedImageFile = null;
    this.previewImage = null;
  }

  // save profile image
  saveProfileImage() {
    if (!this.selectedImageFile) {
      this.toastService.showToast('No image selected', 'info');
      return;
    }

    this.loadingEditImage.set(true);
    const formData = new FormData();
    formData.append('image', this.selectedImageFile);

    this.teacherService
      .updateTeacherImage(this.teacher().teacher_id, formData)
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.toastService.showToast(res.message, 'success');
            this.loadTeacherInfo();
            this.clearImage();
            this.loadingEditImage.set(false);
          }, 2000);
        },
        error: (err) => {
          console.error('Error updating profile image:', err);
          this.toastService.showToast(err.error.message, 'danger');
          this.loadingEditImage.set(false);
        },
      });
  }
}
