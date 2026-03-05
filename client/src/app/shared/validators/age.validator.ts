import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that the date value corresponds to a person aged at least 18 years.
 * Accepts both Date objects (from MatDatepicker) and ISO strings.
 */
export function minAgeValidator(minAge: number = 18): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value;
		if (!value) {
			return null; // Let required validator handle empty
		}

		const birth = value instanceof Date ? value : new Date(value as string);
		if (isNaN(birth.getTime())) {
			return { invalidDate: true };
		}

		const today = new Date();
		const age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		const dayDiff = today.getDate() - birth.getDate();
		const adjusted = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

		return adjusted >= minAge ? null : { minAge: { required: minAge, actual: adjusted } };
	};
}
