import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { clean } from 'rut.js';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // --- Reactive State with Signals ---
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _authError = signal<string | null>(null);

  // --- Public Computed Signals ---
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();
  readonly userName = computed(() => this._currentUser()?.nombre ?? '');
  readonly userRut = computed(() => this._currentUser()?.rut ?? '');

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<boolean> {
    this._isLoading.set(true);
    this._authError.set(null);

    return this.http.get<any>(`${environment.apiUrl}/usuario`, {
      params: {
        rut: clean(credentials.rut.trim()),
        password: credentials.password.trim()
      }
    }).pipe(
      tap(response => {
        const user: User = {
          nombre: response.nombre ?? response.user?.nombre,
          email: response.email ?? response.user?.email ?? '',
          rut: clean(credentials.rut.trim()),
          saldo: response.saldo ?? 1500000
        };
        this.setSession(user);
        this._isLoading.set(false);
      }),
      map(() => true),
      catchError(error => {
        this._authError.set(
          error.status === 401
            ? 'RUT o contrasena incorrectos'
            : 'Error de conexion. Intente nuevamente.'
        );
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  register(data: RegisterRequest): Observable<boolean> {
    this._isLoading.set(true);
    this._authError.set(null);

    return this.http.post<any>(`${environment.apiUrl}/usuario`, {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      email: data.email.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      rut: clean(data.rut.trim()),
      password: data.password.trim()
    }).pipe(
      tap(() => this._isLoading.set(false)),
      map(() => true),
      catchError(error => {
        this._authError.set(
          error.status === 409
            ? 'El RUT ya se encuentra registrado'
            : 'Error al registrar. Intente nuevamente.'
        );
        this._isLoading.set(false);
        return of(false);
      })
    );
  }

  logout(): void {
    this._currentUser.set(null);
    this._authError.set(null);
    localStorage.removeItem('mb_session');
    this.router.navigate(['/auth/login']);
  }

  clearError(): void {
    this._authError.set(null);
  }

  private setSession(user: User): void {
    this._currentUser.set(user);
    // Store minimal session data - avoid storing sensitive tokens in localStorage
    localStorage.setItem('mb_session', JSON.stringify({
      nombre: user.nombre,
      email: user.email,
      rut: user.rut,
      saldo: user.saldo
    }));
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem('mb_session');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.rut && data.nombre) {
          this._currentUser.set(data as User);
        }
      }
    } catch {
      localStorage.removeItem('mb_session');
    }
  }
}
