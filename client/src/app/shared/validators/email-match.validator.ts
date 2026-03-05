import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Cross-field validator: checks that two email fields match.
 * Apply to the parent FormGroup; specify the names of both controls.
 */
export function emailMatchValidator(emailField: string, confirmField: string): ValidatorFn {
	return (group: AbstractControl): ValidationErrors | null => {
		const email = group.get(emailField)?.value as string;
		const confirm = group.get(confirmField)?.value as string;

		if (!email || !confirm) {
			return null; // Individual required validators handle empty
		}

		return email === confirm ? null : { emailMismatch: true };
	};
}
