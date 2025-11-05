import type { SimulationConfig } from '@/types';
import { seededRng } from './rng';

type Scenario = {
  name: string;
  mean_return: number;
  volatility: number;
  inflation: number;
  runs?: Array<{ ending_balance: number; min_balance: number }>;
};

export type MonteCarloParams = {
  scenarios: Scenario[];
  initialBalance: number;
  annualContribution: number;
  years: number;
  simulationConfig?: SimulationConfig | null;
};

function createUniformGenerator(seed?: number | null) {
  if (typeof seed === 'number') return seededRng(seed);
  return Math.random;
}

function sampleNormal(mean: number, std: number, rng: () => number) {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = Math.max(rng(), Number.EPSILON);
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

export function generateMonteCarloScenarios({
  scenarios,
  initialBalance,
  annualContribution,
  years,
  simulationConfig,
}: MonteCarloParams): Scenario[] {
  const iterations = Math.max(1, Math.round(simulationConfig?.iterations ?? 64));
  const rng = createUniformGenerator(simulationConfig?.seed);

  return scenarios.map((scenario) => {
    const runs: Array<{ ending_balance: number; min_balance: number }> = [];

    for (let i = 0; i < iterations; i += 1) {
      let balance = initialBalance;
      let minBalance = balance;

      for (let year = 0; year < years; year += 1) {
        const draw = sampleNormal(scenario.mean_return, scenario.volatility, rng);
        const netReturn = draw - scenario.inflation;
        balance = (balance + annualContribution) * (1 + netReturn);
        if (!Number.isFinite(balance)) balance = 0;
        minBalance = Math.min(minBalance, balance);
      }

      runs.push({
        ending_balance: Number(balance.toFixed(2)),
        min_balance: Number(minBalance.toFixed(2)),
      });
    }

    return { ...scenario, runs };
  });
}
