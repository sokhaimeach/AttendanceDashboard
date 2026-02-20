import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { TeacherInterface } from '../../models/teacher.model';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {
  // inject services
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  isSidebarCollapsed = false;
  // logged in teacher account
  teacher = signal<TeacherInterface>({
    teacher_id: 0,
    teachername_en: "",
    teachername_kh: "",
    role: "teacher",
    phone: "",
    is_active: false,
    image_url: null
  });

  ngOnInit(): void {
    const sidebar = sessionStorage.getItem('sidebar_collapsed');
    this.isSidebarCollapsed = sidebar? JSON.parse(sidebar):false;
    this.loadTeacherAccount();
  }

  // load logged in account info
  loadTeacherAccount(): void {
    this.teacher.set(this.authService.getTeacherProfile());
  }

  // logout
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }


  // helper function (toggle sidbar)
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    sessionStorage.setItem('sidebar_collapsed', JSON.stringify(this.isSidebarCollapsed));
  }
}
