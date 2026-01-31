import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-dialog__icon-wrapper" [class]="'confirm-dialog__icon-wrapper--' + (data.type ?? 'info')">
        <mat-icon class="confirm-dialog__icon">{{ iconMap[data.type ?? 'info'] }}</mat-icon>
      </div>

      <h2 mat-dialog-title>{{ data.title }}</h2>

      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">
          {{ data.cancelText ?? 'Cancelar' }}
        </button>
        <button mat-flat-button
                color="primary"
                (click)="dialogRef.close(true)">
          {{ data.confirmText ?? 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      text-align: center;
      padding: 16px 8px 0;
    }

    .confirm-dialog__icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .confirm-dialog__icon-wrapper--info { background: #CFF4FC; color: #0DCAF0; }
    .confirm-dialog__icon-wrapper--success { background: #E0FAED; color: #65E4A3; }
    .confirm-dialog__icon-wrapper--warning { background: #FFF3E0; color: #FD7E14; }
    .confirm-dialog__icon-wrapper--error { background: #FBE7E9; color: #DC3545; }

    .confirm-dialog__icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
  `]
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  readonly iconMap: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error'
  };
}
