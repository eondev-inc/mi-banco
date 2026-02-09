import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Bank } from '../models/user.model';

/**
 * Lista de bancos chilenos más comunes
 * Datos mockeados para evitar dependencia de API externa
 */
const CHILEAN_BANKS: Bank[] = [
  { id: '001', name: 'Banco de Chile' },
  { id: '012', name: 'Banco Estado' },
  { id: '014', name: 'Banco Scotiabank' },
  { id: '016', name: 'Banco BCI' },
  { id: '027', name: 'Banco Corpbanca' },
  { id: '028', name: 'Banco Bice' },
  { id: '031', name: 'Banco HSBC' },
  { id: '037', name: 'Banco Santander' },
  { id: '039', name: 'Banco Itaú' },
  { id: '049', name: 'Banco Security' },
  { id: '051', name: 'Banco Falabella' },
  { id: '053', name: 'Banco Ripley' },
  { id: '055', name: 'Banco Consorcio' },
  { id: '504', name: 'Banco BBVA' },
  { id: '672', name: 'Coopeuch' },
  { id: '673', name: 'Prepago Los Héroes' },
  { id: '729', name: 'Mercado Pago' }
];

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly _banks = signal<Bank[]>(CHILEAN_BANKS);
  readonly banks = this._banks.asReadonly();

  /**
   * Loads the bank list (returns mocked data immediately)
   * Kept as Observable for compatibility with existing code
   */
  loadBanks(): Observable<Bank[]> {
    return of(CHILEAN_BANKS);
  }
}
