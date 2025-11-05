import type { Example } from '@/types';

export const languageIntro: Example = {
  id: 'language-intro',
  title: 'Language Intro',
  mode: 'notebook',
  schema_src: `schema do
  # Quick tour of core Kumi syntax, functions, and operators.
  #
  # Navigation tips:
  # - Use the example picker (top-left) to see other demos.
  # - Hit the compile ▶ button (or Shift+Enter) after edits.
  # - Open docs/SYNTAX.md + docs/FUNCTIONS.md for more depth.
  #
  # Language building blocks:
  # - Declarations: let/value/trait wrap intermediate values and outputs.
  # - Core functions use fn(:name, ...). See below for count/max/concat usage.
  # - Operators (+, >, &, etc.) follow familiar arithmetic / boolean precedence; add parentheses for clarity when in doubt.
  # - Built-ins like select(...) run conditional logic without fn(:).
  input do
    string :name
    float  :passing_threshold
    array :assessments do
      hash :assessment do
        string :label
        float  :score
      end
    end
  end

  let :scores, input.assessments.assessment.score
  let :average_score, fn(:mean, scores)
  let :best_score, fn(:max, scores)
  let :spread, fn(:max, scores) - fn(:min, scores)

  # Traits act as reusable boolean masks for conditional aggregates.
  trait :passed_assessment, input.assessments.assessment.score >= input.passing_threshold

  value :overview, {
    greeting: fn(:concat, "Hello, ", input.name),
    attempts: fn(:count, scores),
    average: average_score,
    best: best_score,
    spread: spread,
    any_passed: fn(:any, passed_assessment),
    comparison_example: average_score >= input.passing_threshold
  }

  # Aggregations pair masks with data via *_if helpers.
  value :passed_total, fn(:sum_if, scores, passed_assessment)
  value :passed_count, fn(:count_if, passed_assessment, true)
  value :message, select(average_score >= input.passing_threshold,
    "Great job!",
    "Keep practicing."
  )

  value :operator_examples, {
    sum: 2 + 3,
    difference: 5 - 1,
    product: 4 * 6,
    quotient: 20 / 4,
    exponent: 2 ** 3,
    comparison: average_score > input.passing_threshold,
    boolean: (average_score >= 80) & (best_score >= 90)
  }
end`,
  base_input: {
    name: 'Ada',
    passing_threshold: 75.0,
    assessments: [
      { label: 'Quiz 1', score: 68.5 },
      { label: 'Quiz 2', score: 88.0 },
      { label: 'Project', score: 92.0 },
    ],
  },
};
