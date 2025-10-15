import type { Example } from '@/types';

export const gameOfLife: Example = {
  id: 'game-of-life',
  title: "Conway's Game of Life",
  mode: 'notebook',
  schema_src: `schema do
  input do
    array :rows do
      array :col do
        integer :alive # 0 or 1
      end
    end
  end

  let :a, input.rows.col.alive

  # axis_offset: 0 = x, 1 = y
  let :n,  shift(a, -1, axis_offset: 1)
  let :s,  shift(a,  1, axis_offset: 1)
  let :w,  shift(a, -1)
  let :e,  shift(a,  1)
  let :nw, shift(n, -1)
  let :ne, shift(n,  1)
  let :sw, shift(s, -1)
  let :se, shift(s,  1)

  let :neighbors, fn(:sum, [n, s, w, e, nw, ne, sw, se])

  # Conway rules
  let :alive, a > 0
  let :n3_alive, neighbors == 3
  let :n2_alive, neighbors == 2
  let :keep_alive, n2_alive & alive

  let :next_alive, n3_alive | keep_alive

  value :next_state, select(next_alive, 1, 0)
end`,
  base_input: {
    rows: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  visualization_config: { outputs: { next_state: { type: 'grid' } } },
  execution_config: {
    type: 'continuous',
    continuous: {
      feedback_mappings: [{ from_output: 'next_state', to_input: 'rows' }],
      playback_speed: 250,
    },
  },
};
