import { Routes } from '@angular/router';
import { RecordAttendance } from './feature/record-attendance/record-attendance';
// import { Student } from './feature/student/student';

export const routes: Routes = [
    {path: '', redirectTo: 'admin-layout', pathMatch: 'full' },
    {path: 'admin-layout', loadComponent: () => import('./layouts/admin-layout/admin-layout').then(c => c.AdminLayout),
        children: [
            {path: '', redirectTo: 'students', pathMatch: 'full' },
            {path: 'students', loadComponent: () => import('./feature/student/student').then(c => c.Student)},
            {path: 'record', component: RecordAttendance},
            {path: 'classes', loadComponent: () => import('./feature/class/class').then(c => c.Class)},
            {path: 'attendance', loadComponent: () => import('./feature/attendance/attendance').then(c => c.Attendance)}
        ]
    },
];
