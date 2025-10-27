type Validator = (value: any) => string | null;

export function createStringValidator(): Validator {
  return (value: any) => {
    if (typeof value !== 'string') return `Expected string, got ${typeof value}`;
    return null;
  };
}

export function createIntegerValidator(): Validator {
  return (value: any) => {
    if (!Number.isInteger(value)) {
      return `Expected integer, got ${typeof value}${Number.isNaN(value) ? ' (NaN)' : ''}`;
    }
    return null;
  };
}

export function createFloatValidator(): Validator {
  return (value: any) => {
    if (typeof value !== 'number') return `Expected number, got ${typeof value}`;
    return null;
  };
}

export function createBooleanValidator(): Validator {
  return (value: any) => {
    if (typeof value !== 'boolean') return `Expected boolean, got ${typeof value}`;
    return null;
  };
}

export function createArrayValidator(elementValidator: Validator): Validator {
  return (value: any) => {
    if (!Array.isArray(value)) return `Expected array, got ${typeof value}`;
    for (let i = 0; i < value.length; i++) {
      const error = elementValidator(value[i]);
      if (error) return `[${i}]: ${error}`;
    }
    return null;
  };
}

export function createObjectValidator(fieldValidators: Record<string, Validator>): Validator {
  return (value: any) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return `Expected object, got ${Array.isArray(value) ? 'array' : typeof value}`;
    }
    for (const [key, validator] of Object.entries(fieldValidators)) {
      if (!(key in value)) return `${key}: Required field missing`;
      const error = validator(value[key]);
      if (error) return `${key}: ${error}`;
    }
    return null;
  };
}
