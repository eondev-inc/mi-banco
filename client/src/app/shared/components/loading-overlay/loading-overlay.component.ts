import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { Observable } from 'rxjs';

/**
 * Componente de overlay global para mostrar estados de carga
 * Se muestra/oculta automáticamente según LoadingService
 */
@Component({
    selector: 'app-loading-overlay',
    templateUrl: './loading-overlay.component.html',
    styleUrls: ['./loading-overlay.component.scss'],
    standalone: false
})
export class LoadingOverlayComponent {
  loading$: Observable<boolean>;
  message$: Observable<string>;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
    this.message$ = this.loadingService.message$;
  }
}
