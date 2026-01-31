import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable page header component with title, subtitle, and optional icon.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <header class="page-header" role="banner">
      @if (icon()) {
        <mat-icon class="page-header__icon">{{ icon() }}</mat-icon>
      }
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
    }
    .page-header__icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--mb-primary, #1976D2);
      margin-top: 2px;
    }
    .page-header__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--mb-text-primary, #212121);
      margin: 0;
      letter-spacing: -0.5px;
    }
    .page-header__subtitle {
      font-size: 0.9375rem;
      color: var(--mb-text-secondary, #616161);
      margin: 4px 0 0;
    }
  `]
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
}
