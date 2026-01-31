import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { validate, format, clean } from 'rut.js';

/**
 * Validator for Chilean RUT (Rol Unico Tributario).
 * Validates format and check digit, then formats the control value.
 */
export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Let required validator handle empty
    }

    const cleaned = clean(value);
    if (cleaned.length < 7 || !validate(cleaned)) {
      return { invalidRut: true };
    }

    // Format the value for display without emitting a new event
    const formatted = format(cleaned);
    if (control.value !== formatted) {
      control.setValue(formatted, { emitEvent: false });
    }

    return null;
  };
}
