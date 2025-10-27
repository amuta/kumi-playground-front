export interface ValidationError {
  field: string;
  message: string;
  path: string[];
}

export class ErrorCollector {
  private errors: ValidationError[] = [];

  addError(field: string, message: string, path: string[]): void {
    this.errors.push({ field, message, path });
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  formatErrors(): string {
    if (this.errors.length === 0) return '';
    const lines = this.errors.map((e) => `  • ${e.field}: ${e.message}`);
    return 'Input validation errors:\n' + lines.join('\n');
  }

  clear(): void {
    this.errors = [];
  }
}
