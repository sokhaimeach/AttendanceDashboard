import { Component, OnInit } from '@angular/core';
import { Studentservice } from '../../services/student/studentservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-record-attendance',
  imports: [CommonModule],
  templateUrl: './record-attendance.html',
  styleUrl: './record-attendance.css',
})
export class RecordAttendance implements OnInit {
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  students: any[] = [];
  presentDays: number = new Date().getDay();

  constructor(private studentservice: Studentservice) {}

  ngOnInit(): void {
    console.log(this.presentDays)
    this.getStudents();
  }

  // get students by class ID
  getStudents() {
    this.studentservice.getStudentsByClassId(31, "", "", "", 0).subscribe({
      next: (res: any) => {
        this.students = res.data;
        console.log(this.students);
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
}
