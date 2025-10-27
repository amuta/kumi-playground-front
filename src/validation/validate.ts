import type { InputField } from '@/types';
import { ErrorCollector } from './error-collector';
import { schemaToValidator } from './schema-to-validator';

export function validateInputData(
  input: Record<string, any>,
  schema: Record<string, InputField>
): ErrorCollector {
  const collector = new ErrorCollector();

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    if (!(fieldName in input)) {
      collector.addError(fieldName, 'Required field missing', [fieldName]);
    } else {
      const validator = schemaToValidator(fieldSchema);
      const error = validator(input[fieldName]);
      if (error) {
        collector.addError(fieldName, error, [fieldName]);
      }
    }
  }

  return collector;
}
