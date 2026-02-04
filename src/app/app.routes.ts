import { Routes } from '@angular/router';
import { RecordAttendance } from './feature/record-attendance/record-attendance';
// import { Student } from './feature/student/student';

export const routes: Routes = [
    {path: '', redirectTo: 'admin-layout', pathMatch: 'full' },
    {path: 'admin-layout', loadComponent: () => import('./layouts/admin-layout/admin-layout').then(c => c.AdminLayout)},
    {path: 'record', component: RecordAttendance},
    {path: 'student', loadComponent: () => import('./feature/student/student').then(c => c.Student)},
    {path: 'class', loadComponent: () => import('./feature/class/class').then(c => c.Class)}
];
