import { Injectable } from '@nestjs/common';
import { Employee } from '../../entities/employee.entity';
import { TaxConfig } from '../../entities/tax-config.entity';

@Injectable()
export class ComplianceService {
  calculatePPh21(baseSalary: number, totalAllowances: number, totalDeductions: number, employee: Employee, taxConfigs: TaxConfig[]): number {
    const monthlyGross = baseSalary + totalAllowances;
    const annualGross = monthlyGross * 12;

    const ptkp = this.getPTKP(employee.ptkp_category || 'TK0', taxConfigs);
    const taxableAnnual = Math.max(0, annualGross - ptkp - (totalDeductions * 12));

    // Progressive tax brackets for Indonesia PPh 21
    const brackets = taxConfigs.filter(c => c.ptkp_category === 'progressive').sort((a, b) => a.bracket_min - b.bracket_min);
    let annualTax = 0;

    if (brackets.length > 0) {
      annualTax = this.calculateProgressiveTax(taxableAnnual, brackets);
    } else {
      // Default progressive tax if no config
      annualTax = this.defaultProgressiveTax(taxableAnnual);
    }

    return Math.round((annualTax / 12) * 100) / 100;
  }

  getPTKP(category: string, taxConfigs: TaxConfig[]): number {
    const config = taxConfigs.find(c => c.ptkp_category === category && c.ptkp_amount > 0);
    if (config) return Number(config.ptkp_amount);

    const defaults: Record<string, number> = {
      'TK0': 54000000, // Single, no dependents
      'TK1': 58500000,
      'TK2': 63000000,
      'TK3': 67500000,
      'K0': 58500000,  // Married, no dependents
      'K1': 63000000,
      'K2': 67500000,
      'K3': 72000000,
    };
    return defaults[category] || 54000000;
  }

  calculateProgressiveTax(taxableIncome: number, brackets: TaxConfig[]): number {
    let remaining = taxableIncome;
    let totalTax = 0;
    let prevMax = 0;

    for (const bracket of brackets) {
      const min = Number(bracket.bracket_min);
      const max = bracket.bracket_max ? Number(bracket.bracket_max) : Infinity;
      const rate = Number(bracket.rate) / 100;

      if (remaining <= 0) break;
      const taxable = Math.min(remaining, max - min);
      totalTax += taxable * rate;
      remaining -= taxable;
      prevMax = max;
    }

    return totalTax;
  }

  defaultProgressiveTax(taxableAnnual: number): number {
    let tax = 0;
    let remaining = taxableAnnual;
    const tiers = [
      { max: 60000000, rate: 0.05 },
      { max: 250000000, rate: 0.15 },
      { max: 500000000, rate: 0.25 },
      { max: 5000000000, rate: 0.30 },
      { max: Infinity, rate: 0.35 },
    ];
    let prevMax = 0;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const bracketSize = tier.max - prevMax;
      const taxable = Math.min(remaining, bracketSize);
      tax += taxable * tier.rate;
      remaining -= taxable;
      prevMax = tier.max;
    }
    return tax;
  }

  calculateTHR(employee: Employee, monthsWorked?: number): number {
    const baseSalary = Number(employee.base_salary);
    const permanentAllowances = 0; // Allowances considered permanent could be added here
    const workMonths = monthsWorked || 12;

    if (workMonths >= 12) {
      return baseSalary + permanentAllowances;
    }
    return ((baseSalary + permanentAllowances) / 12) * workMonths;
  }
}
