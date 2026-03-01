import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TelegramService } from '../../services/telegram/telegram.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword {
  // inject service
  protected readonly telegramService = inject(TelegramService);

  form: ForgotForm = {
    teachername_kh: '',
    teachername_en: '',
    phone: '',
    email: '',
  };

  touched: Record<FieldKey, boolean> = {
    teachername_kh: false,
    teachername_en: false,
    phone: false,
    email: false,
  };

  loading = signal<boolean>(false);
  errorMsg = '';
  successMsg = '';

  touch(field: FieldKey) {
    this.touched[field] = true;
  }

  private phoneDigits(v: string) {
    return (v || '').replace(/\D/g, '');
  }

  private isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
  }

  showError(field: FieldKey): boolean {
    if (!this.touched[field]) return false;

    const v = (this.form[field] || '').trim();

    if (field === 'teachername_kh') return v.length === 0;
    if (field === 'teachername_en') return v.length === 0;
    if (field === 'phone') return this.phoneDigits(this.form.phone).length < 8;
    if (field === 'email') return !this.isEmail(this.form.email);

    return false;
  }

  private validAll(): boolean {
    return (
      this.form.teachername_kh.trim().length > 0 &&
      this.form.teachername_en.trim().length > 0 &&
      this.phoneDigits(this.form.phone).length >= 8 &&
      this.isEmail(this.form.email)
    );
  }

  submit() {
    // mark all as touched
    (Object.keys(this.touched) as FieldKey[]).forEach(
      (k) => (this.touched[k] = true),
    );

    this.errorMsg = '';
    this.successMsg = '';

    if (!this.validAll()) {
      this.errorMsg = 'Please check your information and try again.';
      return;
    }

    const message = this.formatTelegramMessage(this.form);

    this.loading.set(true);

    this.telegramService.sendSupportMessage(message).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMsg =
          'If your info matches our records, we sent a new password to your email.';
      },
      error: (err) => {
        this.loading.set(false);
      }
    });
  }

  private formatTelegramMessage(data: ForgotForm): string {
    const safe = (v: any) => String(v ?? '').trim() || '-';

    return (
      `*🔐 Forgot Password Request*\n\n` +
      `*KH:* ${safe(data.teachername_kh)}\n` +
      `*EN:* ${safe(data.teachername_en)}\n` +
      `*Phone:* ${safe(data.phone)}\n` +
      `*Email:* ${safe(data.email)}`
    );
  }

  resetForm() {
    this.form = {
      teachername_kh: '',
      teachername_en: '',
      phone: '',
      email: '',
    };
    (Object.keys(this.touched) as FieldKey[]).forEach(
      (k) => (this.touched[k] = false),
    );
    this.errorMsg = '';
    this.successMsg = '';
    this.loading.set(false);
  }
}

type ForgotForm = {
  teachername_kh: string;
  teachername_en: string;
  phone: string;
  email: string;
};

type FieldKey = keyof ForgotForm;
