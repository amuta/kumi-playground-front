import type { Example } from '@/types';

export const arrayOperations: Example = {
  id: 'array-operations',
  title: 'Array Operations',
  mode: 'notebook',
  schema_src: `schema do
  input do
    array :items do
      hash :item do
        float :price
        integer :quantity
        string :category
      end
    end
    float :tax_rate
  end

  value :subtotals, input.items.item.price * input.items.item.quantity
  value :discounted_price, input.items.item.price * 0.9
  value :is_valid_quantity, input.items.item.quantity > 0
end`,
  base_input: {
    items: [
      { price: 150.0, quantity: 2, category: 'electronics' },
      { price: 75.0, quantity: 1, category: 'books' },
      { price: 200.0, quantity: 3, category: 'electronics' },
    ],
    tax_rate: 0.08,
  },
  visualizations: {
    subtotals: 'table',
    expensive_items: 'table',
    electronics: 'table',
    discounted_price: 'table',
    is_valid_quantity: 'table',
  },
};
