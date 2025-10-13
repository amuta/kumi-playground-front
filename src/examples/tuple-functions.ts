import type { Example } from '@/types';

export const tupleFunctions: Example = {
  id: 'tuple-functions',
  title: 'Tuple Functions',
  mode: 'notebook',
  schema_src: `schema do
  input do
    integer :x
  end

  value :tuple, [1, 2, 3, input.x]
  value :max_1, fn(:max, tuple)
  value :max_2, fn(:max, [1, 2, 3, input.x, 1000])
  value :min_1, fn(:min, tuple)
  value :min_2, fn(:min, [1, 2, 3, input.x, -100])
end`,
  base_input: { x: 100 },
};
