import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  toastMessage = '';
  toastIcon = 'bi-check-circle-fill text-success';

  private toast: any;

  setToast(toastInstance: any) {
    this.toast = toastInstance;
  }

  showToast(msg: string, type: 'success' | 'danger' | 'info') {
    this.toastMessage = msg;

    switch (type) {
      case 'success':
        this.toastIcon = 'bi-check-circle-fill text-success';
        break;
      case 'danger':
        this.toastIcon = 'bi-x-circle-fill text-danger';
        break;
      case 'info':
        this.toastIcon = 'bi-info-circle-fill text-primary';
        break;
    }

    this.toast?.show();
  }
}
