interface InlineValueProps {
  name: string;
  value: any;
}

export function InlineValue({ name, value }: InlineValueProps) {
  const displayValue = value === undefined ? 'undefined' : JSON.stringify(value);

  return (
    <div className="py-2">
      <span className="font-medium">{name}:</span>{' '}
      <span className="font-mono">{displayValue}</span>
    </div>
  );
}
