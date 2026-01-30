import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio global para gestionar estados de carga
 * Reemplaza SweetAlert loaders con un overlay Material nativo
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('Cargando...');

  /** Observable del estado de carga actual */
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /** Observable del mensaje de carga actual */
  public message$: Observable<string> = this.messageSubject.asObservable();

  /**
   * Muestra el overlay de carga
   * @param message Mensaje opcional a mostrar
   */
  show(message: string = 'Cargando...'): void {
    this.messageSubject.next(message);
    this.loadingSubject.next(true);
  }

  /**
   * Oculta el overlay de carga
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Actualiza el mensaje sin cambiar el estado de carga
   * @param message Nuevo mensaje
   */
  updateMessage(message: string): void {
    this.messageSubject.next(message);
  }

  /**
   * Ejecuta una operación async con loading automático
   * @param operation Promesa a ejecutar
   * @param message Mensaje de carga
   */
  async withLoading<T>(
    operation: Promise<T>,
    message: string = 'Procesando...'
  ): Promise<T> {
    this.show(message);
    try {
      const result = await operation;
      return result;
    } finally {
      this.hide();
    }
  }
}
