import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

export const loggedInGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.isLoggedIn()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
