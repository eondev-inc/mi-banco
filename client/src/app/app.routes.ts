import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

/**
 * Application routes with lazy loading and functional guards.
 *
 * Structure:
 * - /auth/*        → Public routes (login, register) protected by noAuthGuard
 * - /dashboard     → Authenticated: Account overview
 * - /transfers/*   → Authenticated: New transfer, new beneficiary
 * - /history       → Authenticated: Transaction history
 * - /profile       → Authenticated: User profile
 *
 * All authenticated routes are wrapped in the LayoutComponent shell.
 */
export const routes: Routes = [
  // --- Public Auth Routes ---
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        title: 'Iniciar Sesion - Mi Banco',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        title: 'Crear Cuenta - Mi Banco',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // --- Authenticated Routes (inside layout shell) ---
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Resumen de Cuenta - Mi Banco',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transfers',
        children: [
          {
            path: 'new',
            title: 'Nueva Transferencia - Mi Banco',
            loadComponent: () =>
              import('./features/transfers/new-transfer/new-transfer.component').then(m => m.NewTransferComponent)
          },
          {
            path: 'beneficiary',
            title: 'Registrar Destinatario - Mi Banco',
            loadComponent: () =>
              import('./features/transfers/new-beneficiary/new-beneficiary.component').then(m => m.NewBeneficiaryComponent)
          },
          { path: '', redirectTo: 'new', pathMatch: 'full' }
        ]
      },
      {
        path: 'history',
        title: 'Historial de Transacciones - Mi Banco',
        loadComponent: () =>
          import('./features/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'profile',
        title: 'Mi Perfil - Mi Banco',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // --- Legacy redirects for backward compatibility ---
  { path: 'inicio', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'transferencias', redirectTo: 'transfers/new', pathMatch: 'full' },
  { path: 'registrar', redirectTo: 'transfers/beneficiary', pathMatch: 'full' },
  { path: 'historial', redirectTo: 'history', pathMatch: 'full' },

  // --- Wildcard ---
  { path: '**', redirectTo: 'auth/login' }
];
