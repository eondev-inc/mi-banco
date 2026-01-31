import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loading.isLoading()) {
      <div class="loading-overlay" role="alert" aria-live="assertive">
        <div class="loading-overlay__card">
          <mat-spinner diameter="48"></mat-spinner>
          @if (loading.message()) {
            <p class="loading-overlay__message">{{ loading.message() }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(2px);
    }

    .loading-overlay__card {
      background: white;
      border-radius: 16px;
      padding: 32px 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .loading-overlay__message {
      font-size: 0.9375rem;
      color: #616161;
      margin: 0;
    }
  `]
})
export class LoadingOverlayComponent {
  readonly loading = inject(LoadingService);
}
