import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material Modules
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Componentes
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

// Servicios (providedIn: 'root', pero exportados para referencia)
import { LoadingService } from './services/loading.service';

// Guards (providedIn: 'root', pero exportados para referencia)
import { AuthGuard } from './guards/auth.guard';

/**
 * Módulo compartido con componentes, servicios y utilidades reutilizables
 * Reemplaza dependencias de SweetAlert con componentes Material nativos
 */
@NgModule({
  declarations: [
    LoadingOverlayComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    LoadingOverlayComponent,
    ConfirmDialogComponent,
    // Re-exportar módulos Material para uso en otros módulos
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class SharedModule { }
