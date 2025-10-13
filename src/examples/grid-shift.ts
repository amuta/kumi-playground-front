import type { Example } from '@/types';

export const gridShift: Example = {
  id: 'grid-shift',
  title: '2D Grid Shift',
  mode: 'notebook',
  schema_src: `schema do
  input do
    array :rows do
      array :col do
        integer :v
      end
    end
  end

  value :shift_cols_right_zero,  shift(input.rows.col.v,  1)
  value :shift_cols_right_wrap,  shift(input.rows.col.v,  1, policy: :wrap)
  value :shift_cols_left_zero,   shift(input.rows.col.v, -1)
  value :shift_cols_left_wrap,   shift(input.rows.col.v, -1, policy: :wrap)

  value :shift_rows_down_zero,   shift(input.rows.col.v,  1, axis_offset: 1)
  value :shift_rows_down_wrap,   shift(input.rows.col.v,  1, axis_offset: 1, policy: :wrap)
  value :shift_rows_up_zero,     shift(input.rows.col.v, -1, axis_offset: 1)
  value :shift_rows_up_wrap,     shift(input.rows.col.v, -1, axis_offset: 1, policy: :wrap)
end`,
  base_input: {
    rows: [
      [1, 2, 3],
      [10, 20, 30],
    ],
  },
};
