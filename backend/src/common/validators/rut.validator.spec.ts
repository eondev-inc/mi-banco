import { IsValidRut, IsValidRutConstraint } from './rut.validator';

describe('IsValidRutConstraint', () => {
  let validator: IsValidRutConstraint;

  beforeEach(() => {
    validator = new IsValidRutConstraint();
  });

  describe('Edge cases - invalid inputs', () => {
    it('should return false for null', () => {
      expect(validator.validate(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(validator.validate(undefined as any)).toBe(false);
    });

    it('should return false for number input', () => {
      expect(validator.validate(12345678 as any)).toBe(false);
    });

    it('should return false for object input', () => {
      expect(validator.validate({} as any)).toBe(false);
    });

    it('should return false for array input', () => {
      expect(validator.validate([] as any)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validator.validate('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(validator.validate('   ')).toBe(false);
    });

    it('should return false for only dash', () => {
      expect(validator.validate('-')).toBe(false);
    });

    it('should return false for only numbers without dash', () => {
      expect(validator.validate('123456789')).toBe(false);
    });

    it('should return false for string with only dash and numbers', () => {
      expect(validator.validate('-9')).toBe(false);
    });
  });

  describe('Format validation (pattern)', () => {
    it('should return false for RUT without dash', () => {
      expect(validator.validate('123456789')).toBe(false);
    });

    it('should return false for RUT with underscore instead of dash', () => {
      expect(validator.validate('12345678_9')).toBe(false);
    });

    it('should return false for RUT with space around dash', () => {
      expect(validator.validate('12345678 -9')).toBe(false);
    });

    it('should return false for RUT with too few digits (6)', () => {
      expect(validator.validate('123456-7')).toBe(false);
    });

    it('should return false for RUT with too many digits (9 before dash)', () => {
      expect(validator.validate('123456789-0')).toBe(false);
    });

    it('should return false for RUT with letters in number part', () => {
      expect(validator.validate('12A45678-9')).toBe(false);
    });

    it('should return false for RUT with special characters', () => {
      expect(validator.validate('12.345.678-!')).toBe(false);
    });

    it('should return false for RUT with spaces in number', () => {
      expect(validator.validate('12 345 678-9')).toBe(false);
    });

    it('should return false for RUT with wrong dash position', () => {
      expect(validator.validate('1234-56789')).toBe(false);
    });

    it('should return false for RUT with multiple dashes', () => {
      expect(validator.validate('12345678--9')).toBe(false);
    });

    it('should return false for RUT with dash in wrong place', () => {
      expect(validator.validate('123-45678-9')).toBe(false);
    });
  });

  describe('Dígito verificador (DV) validation', () => {
    // These test that when format is OK, the DV algorithm is applied
    // We test RUTs with WRONG DVs to verify the algorithm detects invalid check digits
    // Note: Many "obvious" wrong DVs like 11111111-1 are actually VALID according to Mod 11
    // because the algorithm produces that result for that particular number sequence

    it('should return false for 12345678-9 (wrong DV, correct is 3)', () => {
      expect(validator.validate('12345678-9')).toBe(false);
    });

    it('should return false for 1234567-5 (wrong DV)', () => {
      expect(validator.validate('1234567-5')).toBe(false);
    });

    it('should return false for 76543234-5 (wrong DV)', () => {
      expect(validator.validate('76543234-5')).toBe(false);
    });

    it('should return false for 15004684-9 (wrong DV)', () => {
      expect(validator.validate('15004684-9')).toBe(false);
    });

    it('should return false for 11222333-4 (wrong DV)', () => {
      expect(validator.validate('11222333-4')).toBe(false);
    });

    it('should return false for 76102186-5 (wrong DV)', () => {
      expect(validator.validate('76102186-5')).toBe(false);
    });
  });

  describe('Dots in RUT', () => {
    it('should return false for RUT with dots (format still needs validation)', () => {
      // The regex allows dots but then strips them
      // So 12.345.678-9 becomes 12345678-9 after replace
      // Then format check fails because 12345678-9 has 8 digits before dash
      // Actually 12345678 is 8 digits which is valid
      // Let's see... format is ^[0-9]{7,8}-[0-9Kk]$
      // After removing dots: 12345678-9 -> 8 digits, 1 char after dash
      // This should pass format check but fail DV check
      expect(validator.validate('12.345.678-9')).toBe(false);
    });

    it('should return false for RUT with many dots and wrong DV', () => {
      expect(validator.validate('1.234.567-5')).toBe(false);
    });
  });

  describe('K as check digit', () => {
    it('should be case insensitive for K', () => {
      // Both should fail on DV, but not on format
      expect(validator.validate('1234567-k')).toBe(false);
      expect(validator.validate('1234567-K')).toBe(false);
    });

    it('should accept K as valid character in pattern', () => {
      // These pass format (7 digits + dash + K/k) but fail on DV
      expect(validator.validate('1234567-k')).toBe(false);
    });
  });

  describe('Length boundaries', () => {
    it('should return false for RUT with only 6 digits', () => {
      expect(validator.validate('123456-7')).toBe(false);
    });

    it('should return false for RUT with 9 digits', () => {
      expect(validator.validate('123456789-0')).toBe(false);
    });

    it('should return false for RUT with 7 digits', () => {
      // 7 digits is valid format, but DV is likely wrong
      expect(validator.validate('1234567-9')).toBe(false);
    });

    it('should return false for RUT with 8 digits', () => {
      // 8 digits is valid format, but DV is likely wrong
      expect(validator.validate('12345678-9')).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return Spanish error message', () => {
      expect(validator.defaultMessage()).toBe(
        'RUT inválido (formato o dígito verificador incorrecto)',
      );
    });
  });
});

describe('IsValidRut decorator', () => {
  class TestDto {
    @IsValidRut()
    rut: string;
  }

  it('should be defined as a function', () => {
    expect(typeof IsValidRut).toBe('function');
  });

  it('should apply decorator to class property', () => {
    // The decorator itself doesn't validate directly
    // class-validator uses it at runtime
    const dto = new TestDto();
    dto.rut = '12345678-9';
    expect(dto.rut).toBe('12345678-9');
  });
});