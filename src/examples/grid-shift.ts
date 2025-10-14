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
      [100, 100, 100],
      [100, 255, 100],
      [100, 100, 100],
    ],
  },
  // visualizations: {
  //   shift_cols_right_zero: 'grid',
  //   shift_cols_right_wrap: 'grid',
  //   shift_cols_left_zero: 'grid',
  //   shift_cols_left_wrap: 'grid',
  //   shift_rows_down_zero: 'grid',
  //   shift_rows_down_wrap: 'grid',
  //   shift_rows_up_zero: 'grid',
  //   shift_rows_up_wrap: 'grid',
  // },
};
