import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transfer, Beneficiary, AccountSummary } from '../models/user.model';
import { clean } from 'rut.js';

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
    return this.http.get<any>(`${environment.apiUrl}/transferencias`, {
      params: { rut: clean(rut) }
    }).pipe(
      map(res => {
        const list = res.historial ?? res ?? [];
        return Array.isArray(list) ? list : [];
      }),
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
    return this.http.get<any>(`${environment.apiUrl}/cuentas`, {
      params: { rut: clean(rut) }
    }).pipe(
      map(res => {
        const list = res.destinatarios ?? res ?? [];
        return Array.isArray(list) ? list : [];
      }),
      tap(beneficiaries => this._beneficiaries.set(beneficiaries)),
      catchError(() => of([]))
    );
  }

  async createTransfer(rut_cliente: string, data: Partial<Transfer>): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/transferencias`, {
          rut_destinatario: clean(data.rut_destinatario?.trim() ?? ''),
          rut_cliente: clean(rut_cliente),
          nombre: data.nombre?.trim(),
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
        this.http.post(`${environment.apiUrl}/cuentas`, {
          rut_destinatario: clean(data.rut_destinatario?.trim() ?? ''),
          nombre: data.nombre?.trim(),
          apellido: data.apellido?.trim(),
          email: data.email?.trim(),
          telefono: data.telefono?.trim(),
          banco: data.banco?.trim(),
          numero_cuenta: data.numero_cuenta?.trim(),
          tipo_cuenta: data.tipo_cuenta?.trim(),
          rut_cliente: clean(rut_cliente)
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}
