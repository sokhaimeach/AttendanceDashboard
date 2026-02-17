import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ToastService } from './toast.service';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast implements AfterViewInit {
  toastService = inject(ToastService);

  @ViewChild('appToast') appToast!: ElementRef;

  ngAfterViewInit() {
    const toastInstance = new bootstrap.Toast(this.appToast.nativeElement);
    this.toastService.setToast(toastInstance);
  }
}
