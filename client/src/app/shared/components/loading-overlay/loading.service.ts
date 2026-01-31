import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _isLoading = signal(false);
  private readonly _message = signal('');

  readonly isLoading = this._isLoading.asReadonly();
  readonly message = this._message.asReadonly();

  show(message = 'Cargando...'): void {
    this._message.set(message);
    this._isLoading.set(true);
  }

  hide(): void {
    this._isLoading.set(false);
    this._message.set('');
  }

  async withLoading<T>(operation: () => Promise<T>, message?: string): Promise<T> {
    this.show(message);
    try {
      return await operation();
    } finally {
      this.hide();
    }
  }
}
