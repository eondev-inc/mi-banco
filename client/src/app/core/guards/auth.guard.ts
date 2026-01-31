import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Functional guard for protected routes.
 * Redirects unauthenticated users to login with returnUrl preserved.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Guard that prevents authenticated users from accessing auth pages (login/register).
 * Redirects to dashboard if already logged in.
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
