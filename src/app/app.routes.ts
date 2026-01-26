import { Routes } from '@angular/router';
import { RecordAttendance } from './feature/record-attendance/record-attendance';
// import { Student } from './feature/student/student';

export const routes: Routes = [
    {path: '', redirectTo: 'record', pathMatch: 'full' },
    {path: 'record', component: RecordAttendance},
    {path: 'student', loadComponent: () => import('./feature/student/student').then(c => c.Student)}
];
