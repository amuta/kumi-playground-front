import type { Example } from '@/types';

export const monteCarloSimulation: Example = {
  id: 'monte-carlo-simulation',
  title: 'Monte Carlo Portfolio',
  mode: 'notebook',
  schema_src: `schema do
  # Monte Carlo-style portfolio summary. Runs are generated from the config tab,
  # so this schema focuses on aggregating the sampled outcomes.
  input do
    float :initial_balance
    float :annual_contribution
    integer :years

    array :scenarios do
      hash :scenario do
        string :name
        float :mean_return
        float :volatility
        float :inflation
        array :runs do
          hash :run do
            float :ending_balance
            float :min_balance
          end
        end
      end
    end
  end

  let :ending_balances, input.scenarios.scenario.runs.run.ending_balance
  let :min_balances, input.scenarios.scenario.runs.run.min_balance
  let :drawdowns, input.initial_balance - min_balances

  let :run_count, fn(:count, ending_balances)
  let :run_count_float, fn(:to_float, run_count)
  let :sum_selected_endings, fn(:sum, ending_balances)
  let :sum_selected_drawdowns, fn(:sum, drawdowns)

  let :loss_flag, ending_balances < input.initial_balance
  let :loss_count, fn(:count_if, loss_flag, true)

  let :loss_count_float, fn(:to_float, loss_count)
  let :loss_probability, select(run_count_float == 0.0,
    0.0,
    loss_count_float / run_count_float
  )
  let :denominator, fn(:max, [run_count_float, 1.0])
  let :avg_ending, select(run_count == 0, 0.0, sum_selected_endings / denominator)
  let :avg_drawdown, select(run_count == 0, 0.0, sum_selected_drawdowns / denominator)
  let :worst_ending_balance, select(run_count == 0, 0.0, fn(:min, ending_balances))
  let :best_ending_balance, select(run_count == 0, 0.0, fn(:max, ending_balances))

  value :summary, {
    scenario: input.scenarios.scenario.name,
    runs: run_count,
    avg_return: input.scenarios.scenario.mean_return,
    volatility: input.scenarios.scenario.volatility,
    inflation: input.scenarios.scenario.inflation,
    avg_ending_balance: avg_ending,
    worst_ending_balance: worst_ending_balance,
    best_ending_balance: best_ending_balance,
    loss_probability: loss_probability,
    avg_drawdown: avg_drawdown
  }
end`,
  base_input: {
    initial_balance: 500000,
    annual_contribution: 15000,
    years: 30,
    // SchemaTab config + input-gen use this list when seeding runs.
    scenarios: [
      {
        name: 'Conservative',
        mean_return: 0.045,
        volatility: 0.08,
        inflation: 0.02,
      },
      {
        name: 'Balanced',
        mean_return: 0.06,
        volatility: 0.12,
        inflation: 0.025,
      },
      {
        name: 'Aggressive',
        mean_return: 0.075,
        volatility: 0.18,
        inflation: 0.03,
      },
    ],
  },
  visualization_config: {
    outputs: {
      // Front-end reads this key to render the custom table in Execute/Visualize tabs.
      summary: { type: 'table', label: 'Scenario summary' },
    },
  },
  simulation_config: {
    // Config editor pipes these values into run generation before execute/visualize.
    iterations: 1000,
    random_fields: {},
    track_outputs: [],
    seed: 2024,
  },
};
