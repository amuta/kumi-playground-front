import type { Example } from '@/types';

export const shoppingCart: Example = {
  id: 'shopping-cart',
  title: 'Shopping Cart',
  mode: 'notebook',
  schema_src: `schema do
  input do
    integer :price
    integer :quantity
    float :tax_rate
  end

  value :subtotal, input.price * input.quantity
  value :tax, subtotal * input.tax_rate
  value :total, subtotal + tax
end`,
  base_input: { price: 25, quantity: 3, tax_rate: 0.08 },
};
