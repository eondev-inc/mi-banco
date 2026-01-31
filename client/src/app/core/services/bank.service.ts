import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bank } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly _banks = signal<Bank[]>([]);
  readonly banks = this._banks.asReadonly();

  private banksCache$: Observable<Bank[]> | null = null;

  constructor(private readonly http: HttpClient) {}

  loadBanks(): Observable<Bank[]> {
    if (!this.banksCache$) {
      this.banksCache$ = this.http.get<{ banks: Bank[] }>(environment.banksUrl).pipe(
        map(res => res.banks ?? []),
        tap(banks => this._banks.set(banks)),
        shareReplay(1)
      );
    }
    return this.banksCache$;
  }
}
