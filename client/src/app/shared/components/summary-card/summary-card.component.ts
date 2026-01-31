import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * Atomic summary card component for dashboard metrics.
 * Displays a label, value, icon, and optional trend indicator.
 */
@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="summary-card" [class]="'summary-card--' + color()">
      <mat-card-content class="summary-card__content">
        <div class="summary-card__info">
          <span class="summary-card__label">{{ label() }}</span>
          <span class="summary-card__value">{{ value() }}</span>
          @if (subtitle()) {
            <span class="summary-card__subtitle">{{ subtitle() }}</span>
          }
        </div>
        <div class="summary-card__icon-wrapper">
          <mat-icon class="summary-card__icon">{{ icon() }}</mat-icon>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .summary-card {
      border-radius: 0.5rem;
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    .summary-card__content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px !important;
    }
    .summary-card__info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .summary-card__label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--mb-text-secondary, #5B7075);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card__value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--mb-text-primary, #000000);
      letter-spacing: -0.5px;
    }
    .summary-card__subtitle {
      font-size: 0.8125rem;
      color: var(--mb-text-secondary, #5B7075);
    }
    .summary-card__icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .summary-card__icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .summary-card--primary .summary-card__icon-wrapper {
      background: rgba(10, 38, 64, 0.08);
      color: #0A2640;
    }
    .summary-card--success .summary-card__icon-wrapper {
      background: rgba(101, 228, 163, 0.12);
      color: #65E4A3;
    }
    .summary-card--warning .summary-card__icon-wrapper {
      background: rgba(253, 126, 20, 0.12);
      color: #FD7E14;
    }
    .summary-card--accent .summary-card__icon-wrapper {
      background: rgba(13, 202, 240, 0.12);
      color: #0DCAF0;
    }
  `]
})
export class SummaryCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<string>('info');
  readonly color = input<'primary' | 'success' | 'warning' | 'accent'>('primary');
  readonly subtitle = input<string>('');
}
