import type { Example } from '@/types';

export const diamondWave: Example = {
  id: 'diamond-wave',
  title: 'Diamond Wave',
  mode: 'notebook',
  schema_src: `schema do
  input do
    array :rows, index: :y do
      array :col, index: :x do
        integer :_
      end
    end
    integer :step # this counter is passed from the demo worker
  end

  let :w1, index(:y) + index(:x) + input.step
  let :w2, index(:y) - index(:x) + input.step
  let :m1, fn(:mod, w1, 32)
  let :m2, fn(:mod, w2, 32)
  let :s,  m1 + m2
  let :inv, 62 - s
  let :val, fn(:clamp, inv * 4, 0, 255)

  value :next_state, val
end`,
  // grid shape + starting step
  base_input: {
    step: 0,
    rows: Array.from({ length: 80 }, () => Array(120).fill(0)),
  },
  visualization_config: {
    outputs: { next_state: { type: 'grid' } },
  },
  execution_config: {
    type: 'continuous',
    continuous: {
      // advances time: copies outputs.__step -> input.step
      feedback_mappings: [{ from_output: 'step', to_input: 'step' }],
      playback_speed: 20,
    },
  },
  // optional: lets you resize via canvas controls
  canvas_config: {
    render: 'grid2d',
    controls: { width: { default: 120 }, height: { default: 80 } },
  },
};
