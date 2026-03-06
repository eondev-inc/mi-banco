import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  User, 
  LoginRequest, 
  RegisterRequest,
  ApiResponse,
  LoginResponseBody,
  RegisterResponseBody
} from '../models/user.model';
import { clean } from 'rut.js';

/**
 * Formats RUT without dots, only with hyphen (e.g., "12345678-9")
 * Backend expects format: ^[0-9]+-[0-9Kk]$
 */
function formatRutForBackend(rut: string): string {
  const cleaned = clean(rut);
  if (!cleaned || cleaned.length < 2) return cleaned;
  
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

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
  readonly userName = computed(() => this._currentUser()?.nombreCompleto ?? '');
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

    return this.http.post<ApiResponse<LoginResponseBody>>(`${environment.apiUrl}/usuario/login`, {
      rut: formatRutForBackend(credentials.rut.trim()),
      password: credentials.password.trim()
    }).pipe(
      tap(response => {
        const userData = response.body.usuario;
        // Fallback defensivo: usuarios viejos en DB pueden traer `nombre` en vez de `nombres`
        const nombres = userData.nombres ?? (userData as any).nombre ?? '';
        const apellidos = userData.apellidos ?? '';
        const nombreCompleto = userData.nombreCompleto
          ?? (nombres && apellidos ? `${nombres} ${apellidos}` : nombres);
        const user: User = {
          nombres,
          apellidos,
          nombreCompleto,
          email: userData.email ?? '',
          rut: userData.rut,
          telefono: userData.telefono,
          fechaNacimiento: userData.fechaNacimiento,
          direccion: userData.direccion,
          regionId: userData.regionId,
          comunaId: userData.comunaId,
          saldo: 1500000 // Backend doesn't handle real balance
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

    return this.http.post<ApiResponse<RegisterResponseBody>>(`${environment.apiUrl}/usuario`, {
      nombres: data.nombres.trim(),
      apellidos: data.apellidos.trim(),
      email: data.email.trim(),
      emailConfirmacion: data.emailConfirmacion.trim(),
      rut: formatRutForBackend(data.rut.trim()),
      telefono: data.telefono.trim(),
      fechaNacimiento: data.fechaNacimiento,
      direccion: data.direccion.trim(),
      regionId: data.regionId,
      comunaId: data.comunaId,
      password: data.password.trim()
    }).pipe(
      tap(response => {
        const userData = response.body.usuario;
        const user: User = {
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          nombreCompleto: userData.nombreCompleto,
          email: userData.email,
          rut: userData.rut,
          telefono: userData.telefono,
          fechaNacimiento: userData.fechaNacimiento,
          direccion: userData.direccion,
          regionId: userData.regionId,
          comunaId: userData.comunaId,
          saldo: 1500000
        };
        this.setSession(user);
        this._isLoading.set(false);
      }),
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
      nombres: user.nombres,
      apellidos: user.apellidos,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      rut: user.rut,
      telefono: user.telefono,
      fechaNacimiento: user.fechaNacimiento,
      direccion: user.direccion,
      regionId: user.regionId,
      comunaId: user.comunaId,
      saldo: user.saldo
    }));
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem('mb_session');
      if (stored) {
        const data = JSON.parse(stored) as User & { nombre?: string };
        if (data.rut) {
          // Fallback para sesiones antiguas con campo `nombre` (sin 's')
          if (!data.nombres && data.nombre) {
            data.nombres = data.nombre;
            data.apellidos = data.apellidos ?? '';
            data.nombreCompleto = data.nombreCompleto
              ?? (data.nombres ? `${data.nombres} ${data.apellidos}`.trim() : '');
          }
          if (data.nombres) {
            this._currentUser.set(data);
          }
        }
      }
    } catch {
      localStorage.removeItem('mb_session');
    }
  }
}
