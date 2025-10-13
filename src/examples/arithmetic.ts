import type { Example } from '@/types';

export const arithmetic: Example = {
  id: 'arithmetic',
  title: 'Basic Arithmetic',
  mode: 'notebook',
  schema_src: `schema do
  input do
    integer :x
    integer :y
  end

  value :sum, input.x + input.y
  value :product, input.x * input.y
  value :difference, input.x - input.y
end`,
  base_input: { x: 10, y: 5 },
  visualizations: {
    sum: 'inline',
    product: 'inline',
    difference: 'inline',
  },
};
