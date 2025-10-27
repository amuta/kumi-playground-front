import type { InputField } from '@/types';
import {
  createStringValidator,
  createIntegerValidator,
  createFloatValidator,
  createBooleanValidator,
  createArrayValidator,
  createObjectValidator,
} from './validators';

type Validator = (value: any) => string | null;

export function schemaToValidator(schema: InputField): Validator {
  if (schema.type === 'string') {
    return createStringValidator();
  } else if (schema.type === 'integer') {
    return createIntegerValidator();
  } else if (schema.type === 'float') {
    return createFloatValidator();
  } else if (schema.type === 'boolean') {
    return createBooleanValidator();
  } else if (schema.type === 'array') {
    const elementValidator = schemaToValidator(schema.element);
    return createArrayValidator(elementValidator);
  } else if (schema.type === 'object') {
    const fieldValidators: Record<string, Validator> = {};
    for (const [key, fieldSchema] of Object.entries(schema.fields)) {
      fieldValidators[key] = schemaToValidator(fieldSchema);
    }
    return createObjectValidator(fieldValidators);
  }

  throw new Error(`Unknown schema type`);
}
