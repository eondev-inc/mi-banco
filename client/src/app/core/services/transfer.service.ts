import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Transfer, 
  Beneficiary, 
  AccountSummary,
  ApiResponse,
  HistorialResponseBody,
  DestinatariosResponseBody,
  CreateResponseBody
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
export class TransferService {

  // --- Reactive State ---
  private readonly _transfers = signal<Transfer[]>([]);
  private readonly _beneficiaries = signal<Beneficiary[]>([]);
  private readonly _isLoading = signal(false);

  readonly transfers = this._transfers.asReadonly();
  readonly beneficiaries = this._beneficiaries.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly accountSummary = computed<AccountSummary>(() => {
    const txs = this._transfers();
    const egresos = txs.reduce((sum, t) => sum + (t.monto || 0), 0);
    return {
      saldo: 1500000 - egresos,
      ingresos: 0,
      egresos,
      transferenciasRecientes: txs.length
    };
  });

  constructor(private readonly http: HttpClient) {}

  loadTransfers(rut: string): Observable<Transfer[]> {
    this._isLoading.set(true);
    return this.http.get<ApiResponse<HistorialResponseBody>>(`${environment.apiUrl}/transferencias`, {
      params: { rut: formatRutForBackend(rut) }
    }).pipe(
      map(res => res.body?.historial ?? []),
      tap(transfers => {
        this._transfers.set(transfers);
        this._isLoading.set(false);
      }),
      catchError(() => {
        this._isLoading.set(false);
        return of([]);
      })
    );
  }

  loadBeneficiaries(rut: string): Observable<Beneficiary[]> {
    return this.http.get<ApiResponse<DestinatariosResponseBody>>(`${environment.apiUrl}/cuentas`, {
      params: { rut: formatRutForBackend(rut) }
    }).pipe(
      map(res => res.body?.destinatarios ?? []),
      tap(beneficiaries => this._beneficiaries.set(beneficiaries)),
      catchError(() => of([]))
    );
  }

  async createTransfer(rut_cliente: string, data: Partial<Transfer>): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<ApiResponse<CreateResponseBody<Transfer>>>(`${environment.apiUrl}/transferencias`, {
          rut_destinatario: formatRutForBackend(data.rut_destinatario?.trim() ?? ''),
          rut_cliente: formatRutForBackend(rut_cliente),
          nombre: data.nombre?.trim(),
          email: data.email?.trim(),
          banco: data.banco?.trim(),
          tipo_cuenta: data.tipo_cuenta?.trim(),
          monto: data.monto
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async registerBeneficiary(rut_cliente: string, data: Partial<Beneficiary>): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<ApiResponse<CreateResponseBody<Beneficiary>>>(`${environment.apiUrl}/cuentas`, {
          rut_destinatario: formatRutForBackend(data.rut_destinatario?.trim() ?? ''),
          nombre: data.nombre?.trim(),
          apellido: data.apellido?.trim(),
          email: data.email?.trim(),
          telefono: data.telefono?.trim(),
          banco: data.banco?.trim(),
          numero_cuenta: data.numero_cuenta?.trim(),
          tipo_cuenta: data.tipo_cuenta?.trim(),
          rut_cliente: formatRutForBackend(rut_cliente)
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}
