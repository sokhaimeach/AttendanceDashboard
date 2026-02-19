import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextLoading } from '../../shared/text-loading/text-loading';
import { Toast } from '../../shared/toast/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth.layout',
  imports: [CommonModule, FormsModule, TextLoading, Toast],
  templateUrl: './auth.layout.html',
  styleUrl: './auth.layout.css',
})
export class AuthLayout {
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);
  form = {
    username: '',
    password: '',
  }
  loading = signal<boolean>(false);
  isFailed = signal<boolean>(false);
  message: string = "";
  constructor(private route: Router) {}

  login() {
    console.log('Login form submitted:', this.form);
    if(!this.form.username || !this.form.password) {
      this.message = 'Please enter both username and password';
      this.isFailed.set(true);
      this.toastService.showToast(this.message, 'danger');
      return;
    }
    this.loading.set(true);

    this.authService.login(this.form.username, this.form.password).subscribe({
      next: (res) => {
        if(res.success) {
          setTimeout(() => {
            const {token, ...data} = res.data;
            this.authService.setToken(token);
            this.authService.setTeacherProfile(data);
            this.loading.set(false);
            this.isFailed.set(false);
            this.route.navigate(['/admin']);
          }, 1000);
        }
      },
      error: (err) => {
        this.isFailed.set(true);
        this.loading.set(false);
        this.message = err.error?.message || 'Login failed. Please check your credentials and try again.';
        this.toastService.showToast(this.message, 'danger');
      }
    })
  }
}
