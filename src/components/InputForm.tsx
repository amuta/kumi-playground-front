import type { InputField } from '@/types';

interface InputFormProps {
  schema: Record<string, InputField>;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export function InputForm({ schema, values, onChange }: InputFormProps) {
  const handleChange = (name: string, value: any) => {
    onChange({ ...values, [name]: value });
  };

  const renderField = (name: string, field: InputField) => {
    if ('type' in field) {
      switch (field.type) {
        case 'integer':
          return (
            <input
              type="number"
              step="1"
              value={values[name] ?? ''}
              onChange={(e) => handleChange(name, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          );

        case 'float':
          return (
            <input
              type="number"
              step="any"
              value={values[name] ?? ''}
              onChange={(e) => handleChange(name, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          );

        case 'string':
          return (
            <input
              type="text"
              value={values[name] ?? ''}
              onChange={(e) => handleChange(name, e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          );

        case 'boolean':
          return (
            <input
              type="checkbox"
              checked={values[name] ?? false}
              onChange={(e) => handleChange(name, e.target.checked)}
              className="w-4 h-4"
            />
          );

        default:
          return (
            <input
              type="text"
              value={JSON.stringify(values[name] ?? '')}
              onChange={(e) => {
                try {
                  handleChange(name, JSON.parse(e.target.value));
                } catch {
                  handleChange(name, e.target.value);
                }
              }}
              className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
              placeholder="JSON value"
            />
          );
      }
    }

    return (
      <input
        type="text"
        value={JSON.stringify(values[name] ?? '')}
        onChange={(e) => {
          try {
            handleChange(name, JSON.parse(e.target.value));
          } catch {
            handleChange(name, e.target.value);
          }
        }}
        className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
        placeholder="JSON value"
      />
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([name, field]) => (
        <div key={name}>
          <label className="block text-sm font-medium mb-2">{name}</label>
          {renderField(name, field)}
        </div>
      ))}
    </div>
  );
}
