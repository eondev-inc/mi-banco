import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
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
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <!-- Sidenav: Boldo dark navy -->
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

        <div class="sidenav-divider"></div>

        <mat-nav-list class="sidenav-nav">
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
          <div class="sidenav-divider"></div>
          <div class="sidenav-user">
            <mat-icon class="sidenav-user__icon">account_circle</mat-icon>
            <div class="sidenav-user__info">
              <span class="sidenav-user__name">{{ auth.userName() || 'Mi cuenta' }}</span>
              <span class="sidenav-user__rut">{{ auth.userRut() }}</span>
            </div>
          </div>
          <div class="sidenav-divider"></div>
          <mat-nav-list>
            <a mat-list-item (click)="logout()" class="logout-item">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>Cerrar Sesion</span>
            </a>
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="layout-content">
        <!-- Toolbar: clean white -->
        <mat-toolbar class="layout-toolbar">
          @if (isMobile()) {
            <button mat-icon-button
                    (click)="sidenav.toggle()"
                    aria-label="Abrir menu de navegacion">
              <mat-icon>menu</mat-icon>
            </button>
          }

          <span class="toolbar-spacer"></span>

          <button mat-icon-button
                  [matMenuTriggerFor]="userMenu"
                  aria-label="Menu de usuario"
                  matTooltip="Mi cuenta"
                  class="user-avatar-btn">
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
      width: 270px;
      background: #0A2640;
      border-right: none;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 28px 20px 24px;
    }

    .sidenav-logo {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #65E4A3;
    }

    .sidenav-brand {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .sidenav-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.12);
      margin: 0 16px;
    }

    /* Force white text on all nav items — MDC overrides require deep selectors */
    .sidenav-nav .mat-mdc-list-item {
      margin: 3px 8px;
      border-radius: 0.5rem;
      color: rgba(255, 255, 255, 0.85) !important;
    }
    .sidenav-nav .mat-mdc-list-item .mdc-list-item__primary-text,
    .sidenav-nav .mat-mdc-list-item .mat-mdc-list-item-title,
    .sidenav-nav .mat-mdc-list-item span[matListItemTitle] {
      color: rgba(255, 255, 255, 0.85) !important;
      font-size: 0.9375rem;
      font-weight: 500;
    }
    .sidenav-nav .mat-mdc-list-item:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }
    .sidenav-nav .mat-mdc-list-item:hover .mdc-list-item__primary-text,
    .sidenav-nav .mat-mdc-list-item:hover .mat-mdc-list-item-title {
      color: #ffffff !important;
    }
    .sidenav-nav .mat-mdc-list-item .mat-icon {
      color: rgba(255, 255, 255, 0.6) !important;
    }
    .sidenav-nav .mat-mdc-list-item:hover .mat-icon {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    .active-link {
      background: rgba(101, 228, 163, 0.15) !important;
    }
    .active-link .mdc-list-item__primary-text,
    .active-link .mat-mdc-list-item-title,
    .active-link span[matListItemTitle] {
      color: #65E4A3 !important;
      font-weight: 600 !important;
    }
    .active-link .mat-icon {
      color: #65E4A3 !important;
    }

    .sidenav-footer {
      margin-top: auto;
    }

    .sidenav-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
    }

    .sidenav-user__icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
    }

    .sidenav-user__info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidenav-user__name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidenav-user__rut {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .logout-item {
      color: rgba(255, 255, 255, 0.5) !important;
      margin: 3px 8px;
      border-radius: 0.5rem;
    }
    .logout-item .mdc-list-item__primary-text,
    .logout-item span[matListItemTitle] {
      color: rgba(255, 255, 255, 0.5) !important;
    }
    .logout-item:hover {
      background: rgba(229, 115, 115, 0.1) !important;
    }
    .logout-item:hover .mdc-list-item__primary-text,
    .logout-item:hover span[matListItemTitle] {
      color: #EF9A9A !important;
    }
    .logout-item:hover .mat-icon {
      color: #EF9A9A !important;
    }
    .logout-item .mat-icon {
      color: rgba(255, 255, 255, 0.4) !important;
    }

    .layout-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #ffffff;
      color: #0A2640;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .toolbar-spacer {
      flex: 1;
    }

    .user-avatar-btn .mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #0A2640;
    }

    .layout-content {
      display: flex;
      flex-direction: column;
      background: #F7F9FA;
    }

    .page-content {
      flex: 1;
      padding: 40px 48px;
      max-width: 1400px;
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
