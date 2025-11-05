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
    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <span className="text-base font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Examples:</span>
      <span className="text-sm font-medium text-muted-foreground sm:hidden">Ex:</span>
      <Select value={currentExample.id} onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto sm:w-[240px] max-w-[70vw] sm:max-w-none border-2 border-primary bg-accent text-accent-foreground hover:bg-accent/90 transition-all font-medium text-sm sm:text-base px-3 py-2" title="Change to explore different examples">
          <SelectValue placeholder="Select an example" />
        </SelectTrigger>
        <SelectContent>
          {examples.map((example) => (
            <SelectItem
              key={example.id}
              value={example.id}
              indicator={false}
              className="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:font-semibold"
            >
              {example.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
