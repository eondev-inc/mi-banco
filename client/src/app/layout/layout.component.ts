import { Component, signal, computed, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <!-- Sidenav for mobile -->
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="layout-sidenav"
        role="navigation"
        aria-label="Menu principal">

        <div class="sidenav-header">
          <mat-icon class="sidenav-logo">account_balance</mat-icon>
          <span class="sidenav-brand">Mi Banco</span>
        </div>

        <mat-divider></mat-divider>

        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link"
               [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
               (click)="isMobile() && sidenav.close()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <mat-nav-list>
            <a mat-list-item (click)="logout()">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>Cerrar Sesion</span>
            </a>
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <!-- Main content area -->
      <mat-sidenav-content class="layout-content">
        <!-- Top toolbar -->
        <mat-toolbar class="layout-toolbar" color="primary">
          @if (isMobile()) {
            <button mat-icon-button
                    (click)="sidenav.toggle()"
                    aria-label="Abrir menu de navegacion">
              <mat-icon>menu</mat-icon>
            </button>
          }

          <span class="toolbar-spacer"></span>

          <!-- User menu -->
          <button mat-icon-button
                  [matMenuTriggerFor]="userMenu"
                  aria-label="Menu de usuario"
                  matTooltip="Mi cuenta">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header" mat-menu-item disabled>
              <strong>{{ auth.userName() }}</strong>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Mi Perfil</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesion</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page content -->
        <main class="page-content" role="main">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
    }

    .layout-sidenav {
      width: 260px;
      background: var(--mb-surface, #fff);
      border-right: 1px solid var(--mb-divider, #e0e0e0);
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
    }

    .sidenav-logo {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--mb-primary, #1976D2);
    }

    .sidenav-brand {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--mb-primary, #1976D2);
      letter-spacing: -0.5px;
    }

    .sidenav-footer {
      margin-top: auto;
    }

    .active-link {
      background: rgba(25, 118, 210, 0.08) !important;
      color: var(--mb-primary, #1976D2) !important;
      border-left: 3px solid var(--mb-primary, #1976D2);
    }

    .layout-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .layout-content {
      display: flex;
      flex-direction: column;
    }

    .page-content {
      flex: 1;
      padding: 24px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .page-content {
        padding: 16px;
      }
    }

    .user-menu-header {
      padding: 8px 16px;
      opacity: 1 !important;
    }
  `]
})
export class LayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly isMobile = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Resumen', route: '/dashboard', icon: 'dashboard' },
    { label: 'Nueva Transferencia', route: '/transfers/new', icon: 'send' },
    { label: 'Registrar Destinatario', route: '/transfers/beneficiary', icon: 'person_add' },
    { label: 'Historial', route: '/history', icon: 'history' },
    { label: 'Mi Perfil', route: '/profile', icon: 'person' }
  ];

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  logout(): void {
    this.auth.logout();
  }
}
