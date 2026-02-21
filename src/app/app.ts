import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'Attendance_Dashborard';
  protected readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.restoreTeacherRoleFromToken();
    if(this.authService.getToken()) {
      this.authService.getLoggedInByToken().subscribe({
        next: (res) => {
          this.authService.setTeacherProfile(res.data);
        }
      });
    }
  }
}
