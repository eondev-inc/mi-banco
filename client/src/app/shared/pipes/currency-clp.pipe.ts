import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Chilean Peso currency (CLP).
 * Usage: {{ amount | currencyClp }}
 * Output: $1.500.000
 */
@Pipe({
  name: 'currencyClp',
  standalone: true
})
export class CurrencyClpPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') return '$0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0';
    return '$' + Math.round(num).toLocaleString('es-CL');
  }
}
