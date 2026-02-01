import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Bank } from '../models/user.model';

const CHILEAN_BANKS: Bank[] = [
  { id: '001', name: 'Banco de Chile' },
  { id: '009', name: 'Banco Internacional' },
  { id: '012', name: 'Banco Estado' },
  { id: '014', name: 'Scotiabank Chile' },
  { id: '016', name: 'Banco de Credito e Inversiones (BCI)' },
  { id: '027', name: 'Corpbanca' },
  { id: '028', name: 'Banco Bice' },
  { id: '031', name: 'HSBC Bank Chile' },
  { id: '037', name: 'Banco Santander Chile' },
  { id: '039', name: 'Banco Itau Chile' },
  { id: '049', name: 'Banco Security' },
  { id: '051', name: 'Banco Falabella' },
  { id: '053', name: 'Banco Ripley' },
  { id: '054', name: 'Banco Consorcio' },
  { id: '055', name: 'Banco BTG Pactual Chile' },
  { id: '504', name: 'Banco BBVA Chile' },
  { id: '059', name: 'Banco de la Nacion Argentina' },
  { id: '060', name: 'JP Morgan Chase Bank' },
  { id: '061', name: 'Banco Do Brasil S.A.' },
  { id: '300', name: 'Coopeuch' },
];

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly _banks = signal<Bank[]>(CHILEAN_BANKS);
  readonly banks = this._banks.asReadonly();

  loadBanks(): Observable<Bank[]> {
    return of(CHILEAN_BANKS);
  }
}
