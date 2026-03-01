import { Routes } from '@angular/router';
import { authGuard } from './core/guards/authGuard/auth-guard';
import { loggedInGuard } from './core/guards/loggedInGuard/logged-in-guard';
import { roleGuard } from './core/guards/roleGuard/role-guard';

export const routes: Routes = [
    {path: '', redirectTo: 'auth', pathMatch: 'full' },
    {path: 'auth', canActivate: [loggedInGuard], 
        children: [
            {path: '', redirectTo: 'login', pathMatch: 'full'},
            {path: 'login', loadComponent: () => import('./layouts/auth.layout/auth.layout').then(c => c.AuthLayout)},
            {path: 'forget', loadComponent: () => import('./layouts/forget-password/forget-password').then(c => c.ForgetPassword)},    
        ]
    },
    {path: 'admin', canActivate: [authGuard], loadComponent: () => import('./layouts/admin-layout/admin-layout').then(c => c.AdminLayout),
        children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {path: 'dashboard', canActivate: [roleGuard], data: { roles: ['admin', 'teacher']}, loadComponent: () => import('./feature/dashboard/dashboard').then(c => c.Dashboard)},
            {path: 'students', canActivate: [roleGuard], data: { roles: ['admin']}, loadComponent: () => import('./feature/student/student').then(c => c.Student)},
            {path: 'classes', canActivate: [roleGuard], data: { roles: ['admin']}, loadComponent: () => import('./feature/class/class').then(c => c.Class)},
            {path: 'attendance', canActivate: [roleGuard], data: { roles: ['admin', 'teacher']}, loadComponent: () => import('./feature/attendance/attendance').then(c => c.Attendance)},
            {path: 'teachers', canActivate: [roleGuard], data: { roles: ['admin']}, loadComponent: () => import('./feature/teacher/teacher').then(c => c.Teacher)},
            {path: 'subjects', canActivate: [roleGuard], data: { roles: ['admin']}, loadComponent: () => import('./feature/subject/subject').then(c => c.Subject)},
            {path: 'account/:id', canActivate: [roleGuard], data: { roles: ['admin', 'teacher']}, loadComponent: () => import('./feature/account/account').then(c => c.Account)}
        ]
    },
];
