import { useState } from 'react';
import type { InputField } from '@/types';

interface InputFormProps {
  schema: Record<string, InputField>;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export function InputForm({ schema, values, onChange }: InputFormProps) {
  const [textValues, setTextValues] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    onChange({ ...values, [name]: value });
  };

  const renderField = (name: string, field: InputField) => {
    if ('type' in field) {
      switch (field.type) {
        case 'integer':
          return (
            <input
              id={name}
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
              id={name}
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
              id={name}
              type="text"
              value={values[name] ?? ''}
              onChange={(e) => handleChange(name, e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          );

        case 'boolean':
          return (
            <input
              id={name}
              type="checkbox"
              checked={values[name] ?? false}
              onChange={(e) => handleChange(name, e.target.checked)}
              className="w-4 h-4"
            />
          );

        case 'array':
        case 'object': {
          const currentText =
            name in textValues
              ? textValues[name]
              : (values[name] !== undefined ? JSON.stringify(values[name], null, 2) : '');

          return (
            <textarea
              id={name}
              value={currentText}
              onChange={(e) => {
                const newText = e.target.value;
                setTextValues({ ...textValues, [name]: newText });

                try {
                  const parsed = JSON.parse(newText);
                  handleChange(name, parsed);
                  delete textValues[name];
                } catch {
                  // Keep text in local state until valid JSON
                }
              }}
              className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
              placeholder="JSON value"
              rows={6}
            />
          );
        }

        default:
          return (
            <input
              id={name}
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
      <textarea
        id={name}
        value={values[name] !== undefined ? JSON.stringify(values[name], null, 2) : ''}
        onChange={(e) => {
          try {
            handleChange(name, JSON.parse(e.target.value));
          } catch {
            handleChange(name, e.target.value);
          }
        }}
        className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
        placeholder="JSON value"
        rows={6}
      />
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([name, field]) => (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-medium mb-2">{name}</label>
          {renderField(name, field)}
        </div>
      ))}
    </div>
  );
}
