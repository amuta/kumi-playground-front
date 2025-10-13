import type { Example } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExampleSelectorProps {
  examples: Example[];
  currentExample: Example;
  onExampleChange: (example: Example) => void;
}

export function ExampleSelector({
  examples,
  currentExample,
  onExampleChange,
}: ExampleSelectorProps) {
  const handleValueChange = (value: string) => {
    const example = examples.find((ex) => ex.id === value);
    if (example) {
      onExampleChange(example);
    }
  };

  return (
    <Select value={currentExample.id} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select an example" />
      </SelectTrigger>
      <SelectContent>
        {examples.map((example) => (
          <SelectItem key={example.id} value={example.id}>
            {example.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
