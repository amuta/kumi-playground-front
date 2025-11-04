import type { Example } from '@/types';

export const nestedHash: Example = {
  id: 'nested-hash',
  title: 'Nested Hash',
  mode: 'notebook',
  schema_src: `schema do
  input do
    hash :x do
      hash :y do
        integer :z
      end
    end
  end

  value :double, input.x.y.z * 2
end`,
  base_input: {
    x: {
      y: {
        z: 10,
      },
    },
  },
};
