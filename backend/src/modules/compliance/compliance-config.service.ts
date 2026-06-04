import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxConfig } from '../../entities/tax-config.entity';
import { BpjsConfig } from '../../entities/bpjs-config.entity';

@Injectable()
export class ComplianceConfigService {
  constructor(
    @InjectRepository(TaxConfig) private taxRepo: Repository<TaxConfig>,
    @InjectRepository(BpjsConfig) private bpjsRepo: Repository<BpjsConfig>,
  ) {}

  async getTaxConfigs(year?: number) {
    const y = year || new Date().getFullYear();
    return this.taxRepo.find({ where: { year: y } });
  }

  async getBpjsConfigs(year?: number) {
    const y = year || new Date().getFullYear();
    return this.bpjsRepo.find({ where: { year: y } });
  }

  async createTaxConfig(data: Partial<TaxConfig>) { return this.taxRepo.save(this.taxRepo.create(data)); }
  async createBpjsConfig(data: Partial<BpjsConfig>) { return this.bpjsRepo.save(this.bpjsRepo.create(data)); }

  async seedDefaults() {
    const year = new Date().getFullYear();

    const existingTax = await this.taxRepo.count({ where: { year } });
    if (existingTax === 0) {
      const ptkpValues: Partial<TaxConfig>[] = [
        { year, ptkp_category: 'TK0', ptkp_amount: 54000000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'TK1', ptkp_amount: 58500000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'TK2', ptkp_amount: 63000000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'K0', ptkp_amount: 58500000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'K1', ptkp_amount: 63000000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'K2', ptkp_amount: 67500000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'K3', ptkp_amount: 72000000, bracket_min: 0, bracket_max: 0, rate: 0 },
        { year, ptkp_category: 'progressive', ptkp_amount: 0, bracket_min: 0, bracket_max: 60000000, rate: 5 },
        { year, ptkp_category: 'progressive', ptkp_amount: 0, bracket_min: 60000000, bracket_max: 250000000, rate: 15 },
        { year, ptkp_category: 'progressive', ptkp_amount: 0, bracket_min: 250000000, bracket_max: 500000000, rate: 25 },
        { year, ptkp_category: 'progressive', ptkp_amount: 0, bracket_min: 500000000, bracket_max: 5000000000, rate: 30 },
        { year, ptkp_category: 'progressive', ptkp_amount: 0, bracket_min: 5000000000, rate: 35 },
      ];
      for (const v of ptkpValues) await this.taxRepo.save(this.taxRepo.create(v));
    }

    const existingBpjs = await this.bpjsRepo.count({ where: { year } });
    if (existingBpjs === 0) {
      const bpjsValues: Partial<BpjsConfig>[] = [
        { year, type: 'tk', component: 'jkk', employer_rate: 0.0024, employee_rate: 0, description: 'Jaminan Kecelakaan Kerja' },
        { year, type: 'tk', component: 'jkm', employer_rate: 0.003, employee_rate: 0, description: 'Jaminan Kematian' },
        { year, type: 'tk', component: 'jht', employer_rate: 0.037, employee_rate: 0.02, description: 'Jaminan Hari Tua' },
        { year, type: 'tk', component: 'jp', employer_rate: 0.02, employee_rate: 0.01, max_salary_cap: 10042300, description: 'Jaminan Pensiun' },
        { year, type: 'kes', component: 'health', employer_rate: 0.04, employee_rate: 0.01, max_salary_cap: 12000000, description: 'BPJS Kesehatan' },
      ];
      for (const v of bpjsValues) await this.bpjsRepo.save(this.bpjsRepo.create(v));
    }
  }
}
