// src/examples/us-federal-tax-2024.ts
import type { Example } from '@/types';

export const usFederalTax2024: Example = {
  id: 'us-federal-tax-2024',
  title: 'US Tax 2024',
  mode: 'notebook',
  schema_src: `schema do
  input do
    float  :income
    float  :state_rate
    float  :local_rate
    float  :retirement_contrib

    array :statuses do
      hash :status do
        string :name
        float  :std
        float  :addl_threshold
        array  :rates do
          hash :bracket do
            float :lo
            float :hi      # -1 = open-ended
            float :rate
          end
        end
      end
    end
  end

  # shared
  let :big_hi, 100_000_000_000.0
  let :state_tax, input.income * input.state_rate
  let :local_tax, input.income * input.local_rate

  # FICA constants
  let :ss_wage_base, 168_600.0
  let :ss_rate, 0.062
  let :med_base_rate, 0.0145
  let :addl_med_rate, 0.009

  # per-status federal
  let :taxable,   fn(:max, [input.income - input.statuses.status.std, 0])
  let :lo,        input.statuses.status.rates.bracket.lo
  let :hi,        input.statuses.status.rates.bracket.hi
  let :rate,      input.statuses.status.rates.bracket.rate
  let :hi_eff,    select(hi == -1, big_hi, hi)
  let :amt,       fn(:clamp, taxable - lo, 0, hi_eff - lo)
  let :fed_tax,   fn(:sum, amt * rate)
  let :in_br,     (taxable >= lo) & (taxable < hi_eff)
  let :fed_marg,  fn(:sum_if, rate, in_br)
  let :fed_eff,   fed_tax / fn(:max, [input.income, 1.0])

  # per-status FICA
  let :ss_tax,         fn(:min, [input.income, ss_wage_base]) * ss_rate
  let :med_tax,        input.income * med_base_rate
  let :addl_med_tax,   fn(:max, [input.income - input.statuses.status.addl_threshold, 0]) * addl_med_rate
  let :fica_tax,       ss_tax + med_tax + addl_med_tax
  let :fica_eff,       fica_tax / fn(:max, [input.income, 1.0])

  # totals per status
  let :total_tax,  fed_tax + fica_tax + state_tax + local_tax
  let :total_eff,  total_tax / fn(:max, [input.income, 1.0])
  let :after_tax,  input.income - total_tax
  let :take_home,  after_tax - input.retirement_contrib

  # array of result objects, one per status
  value :summary, {
    federal: { marginal: fed_marg, effective: fed_eff, tax: fed_tax },
    fica:    { effective: fica_eff, tax: fica_tax },
    state:   { marginal: input.state_rate, effective: input.state_rate, tax: state_tax },
    local:   { marginal: input.local_rate, effective: input.local_rate, tax: local_tax },
    total:   { effective: total_eff, tax: total_tax },
    after_tax: after_tax,
    retirement_contrib: input.retirement_contrib,
    take_home: take_home
  }
end`,
  base_input: {
    income: 150000,
    state_rate: 0.0,
    local_rate: 0.0,
    retirement_contrib: 0.0,
    statuses: [
      {
        name: 'single',
        std: 14600,
        addl_threshold: 200000,
        rates: [
          { lo: 0, hi: 11600, rate: 0.10 },
          { lo: 11600, hi: 47150, rate: 0.12 },
          { lo: 47150, hi: 100525, rate: 0.22 },
          { lo: 100525, hi: 191950, rate: 0.24 },
          { lo: 191950, hi: 243725, rate: 0.32 },
          { lo: 243725, hi: 609350, rate: 0.35 },
          { lo: 609350, hi: -1, rate: 0.37 }
        ]
      },
      {
        name: 'married_joint',
        std: 29200,
        addl_threshold: 250000,
        rates: [
          { lo: 0, hi: 23200, rate: 0.10 },
          { lo: 23200, hi: 94300, rate: 0.12 },
          { lo: 94300, hi: 201050, rate: 0.22 },
          { lo: 201050, hi: 383900, rate: 0.24 },
          { lo: 383900, hi: 487450, rate: 0.32 },
          { lo: 487450, hi: 731200, rate: 0.35 },
          { lo: 731200, hi: -1, rate: 0.37 }
        ]
      },
      {
        name: 'married_separate',
        std: 14600,
        addl_threshold: 125000,
        rates: [
          { lo: 0, hi: 11600, rate: 0.10 },
          { lo: 11600, hi: 47150, rate: 0.12 },
          { lo: 47150, hi: 100525, rate: 0.22 },
          { lo: 100525, hi: 191950, rate: 0.24 },
          { lo: 191950, hi: 243725, rate: 0.32 },
          { lo: 243725, hi: 365600, rate: 0.35 },
          { lo: 365600, hi: -1, rate: 0.37 }
        ]
      },
      {
        name: 'head_of_household',
        std: 21900,
        addl_threshold: 200000,
        rates: [
          { lo: 0, hi: 16550, rate: 0.10 },
          { lo: 16550, hi: 63100, rate: 0.12 },
          { lo: 63100, hi: 100500, rate: 0.22 },
          { lo: 100500, hi: 191950, rate: 0.24 },
          { lo: 191950, hi: 243700, rate: 0.32 },
          { lo: 243700, hi: 609350, rate: 0.35 },
          { lo: 609350, hi: -1, rate: 0.37 }
        ]
      }
    ]
  }
};
