import type { Example } from '@/types';

export const gameOfLife: Example = {
  id: 'game-of-life',
  title: 'Game of Life',
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
  let :n,  shift(a, -1, axis_offset: 1)
  let :s,  shift(a,  1, axis_offset: 1)
  let :w,  shift(a, -1)
  let :e,  shift(a,  1)
  let :nw, shift(n, -1)
  let :ne, shift(n,  1)
  let :sw, shift(s, -1)
  let :se, shift(s,  1)
  let :neighbors, fn(:sum, [n, s, w, e, nw, ne, sw, se])

  let :alive, a > 0
  let :n3_alive, neighbors == 3
  let :n2_alive, neighbors == 2
  let :keep_alive, n2_alive & alive
  let :next_alive, n3_alive | keep_alive

  value :next_state, select(next_alive, 1, 0)
end`,
  // Visualization tab looks up this key to render the grid overlay.
  visualization_config: { outputs: { next_state: { type: 'grid', label: 'Simulation grid' } } },
  execution_config: {
    type: 'continuous',
    continuous: {
      // Execute/Visualize tabs reuse these mappings to feed outputs back into inputs.
      feedback_mappings: [{ from_output: 'next_state', to_input: 'rows' }],
      playback_speed: 120, // steps per second
    },
  },
  canvas_config: {
    render: 'grid2d',
    controls: {
      // UI controls populate initial inputs when no base_input is provided.
      seed: { default: 42 },
      width: { default: 120 },
      height: { default: 80 },
      density: { default: 0.18 },
    },
  },
};
