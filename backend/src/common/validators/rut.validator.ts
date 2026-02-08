import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidRutConstraint implements ValidatorConstraintInterface {
  validate(rut: string): boolean {
    if (!rut || typeof rut !== 'string') {
      return false;
    }

    // Remove dots and validate format (xxxxxxxx-x or xxxxxxx-x)
    const cleanRut = rut.replace(/\./g, '');
    const rutPattern = /^[0-9]{7,8}-[0-9Kk]$/;

    if (!rutPattern.test(cleanRut)) {
      return false;
    }

    const [numero, dv] = cleanRut.split('-');
    return this.validateDV(numero, dv);
  }

  /**
   * Validate Chilean RUT check digit (dígito verificador)
   * Algorithm: Modulo 11
   */
  private validateDV(numero: string, dv: string): boolean {
    let suma = 0;
    let multiplicador = 2;

    // Calculate from right to left
    for (let i = numero.length - 1; i >= 0; i--) {
      suma += parseInt(numero.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado =
      dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dvCalculado === dv.toUpperCase();
  }

  defaultMessage(): string {
    return 'RUT inválido (formato o dígito verificador incorrecto)';
  }
}

/**
 * Custom decorator to validate Chilean RUT
 * Usage: @IsValidRut() in DTOs
 */
export function IsValidRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRutConstraint,
    });
  };
}
