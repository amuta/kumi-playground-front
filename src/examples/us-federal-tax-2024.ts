// src/examples/us-federal-tax-2024.ts
import type { Example } from '@/types';

export const usFederalTax2024: Example = {
  id: 'us-federal-tax-2024',
  title: 'US Tax 2024',
  mode: 'notebook',
  schema_src: `schema do
  # Declarative tax model: compute brackets, FICA, and totals per filing status.
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

  # --- Shared scaffolding ---------------------------------------------------
  let :gross_income, input.income
  let :state_tax, gross_income * input.state_rate
  let :local_tax, gross_income * input.local_rate

  # --- Filing status context ------------------------------------------------
  let :status_name, input.statuses.status.name
  let :status_std, input.statuses.status.std
  let :status_addl_threshold, input.statuses.status.addl_threshold
  let :taxable_income, fn(:max, [gross_income - status_std, 0])

  # --- Federal brackets -----------------------------------------------------
  let :bracket_lo, input.statuses.status.rates.bracket.lo
  let :bracket_hi_raw, input.statuses.status.rates.bracket.hi
  let :bracket_rate, input.statuses.status.rates.bracket.rate
  let :bracket_is_open, bracket_hi_raw == -1
  let :bracket_cap, select(bracket_is_open, taxable_income, bracket_hi_raw)
  let :bracket_hi_for_clamp, fn(:max, [bracket_cap, bracket_lo])
  let :taxable_in_bracket, fn(:clamp, taxable_income - bracket_lo, 0, bracket_hi_for_clamp - bracket_lo)
  let :federal_tax_per_bracket, taxable_in_bracket * bracket_rate

  value :federal_brackets, {
    range: { lo: bracket_lo, hi: bracket_hi_raw, open_ended: bracket_is_open },
    rate: bracket_rate,
    taxable_amount: taxable_in_bracket,
    tax: federal_tax_per_bracket
  }

  let :federal_tax_total, fn(:sum, federal_tax_per_bracket)
  let :is_marginal_bracket, (taxable_income >= bracket_lo) & (taxable_income < bracket_hi_for_clamp)
  let :federal_marginal_rate, fn(:sum_if, bracket_rate, is_marginal_bracket)
  let :federal_effective_rate, federal_tax_total / fn(:max, [gross_income, 1.0])

  # --- FICA -----------------------------------------------------------------
  let :ss_wage_base, 168_600.0
  let :ss_rate, 0.062
  let :med_base_rate, 0.0145
  let :addl_med_rate, 0.009

  let :social_security_tax, fn(:min, [gross_income, ss_wage_base]) * ss_rate
  let :medicare_tax, gross_income * med_base_rate
  let :medicare_surtax, fn(:max, [gross_income - status_addl_threshold, 0]) * addl_med_rate
  let :fica_tax_total, social_security_tax + medicare_tax + medicare_surtax
  let :fica_effective_rate, fica_tax_total / fn(:max, [gross_income, 1.0])

  # --- Totals & reporting ---------------------------------------------------
  let :overall_tax, federal_tax_total + fica_tax_total + state_tax + local_tax
  let :overall_effective_rate, overall_tax / fn(:max, [gross_income, 1.0])
  let :after_tax_income, gross_income - overall_tax
  let :take_home_income, after_tax_income - input.retirement_contrib

  value :summary, {
    name: status_name,
    taxable_income: taxable_income,
    federal: {
      marginal_rate: federal_marginal_rate,
      effective_rate: federal_effective_rate,
      tax: federal_tax_total
    },
    fica: {
      effective_rate: fica_effective_rate,
      tax: fica_tax_total,
      components: {
        social_security: social_security_tax,
        medicare: medicare_tax,
        medicare_surtax: medicare_surtax
      }
    },
    state: { rate: input.state_rate, tax: state_tax },
    local: { rate: input.local_rate, tax: local_tax },
    totals: {
      effective_rate: overall_effective_rate,
      tax: overall_tax,
      after_tax_income: after_tax_income,
      take_home_income: take_home_income
    },
    retirement_contrib: input.retirement_contrib
  }
end`,
  visualization_config: {
    outputs: {
      federal_brackets: { type: 'table', label: 'Federal bracket detail' },
    },
  },
  base_input: {
    income: 150000,
    state_rate: 0.05,
    local_rate: 0.015,
    retirement_contrib: 6000,
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
