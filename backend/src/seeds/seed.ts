import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { ComplianceConfigService } from '../modules/compliance/compliance-config.service';
import { AuthService } from '../modules/auth/auth.service';

async function seed() {
  // Require env vars for sensitive data — never commit secrets
  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@hris-payroll.com';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!superAdminPassword) {
    console.error(
      'ERROR: SEED_SUPER_ADMIN_PASSWORD env var is required.\n' +
      'Generate a strong password: openssl rand -base64 32\n' +
      'Then run: SEED_SUPER_ADMIN_PASSWORD=<your-password> npm run seed'
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const complianceService = app.get(ComplianceConfigService);
  console.log('Seeding compliance defaults...');
  await complianceService.seedDefaults();

  const authService = app.get(AuthService);
  console.log('Creating super admin...');
  try {
    await authService.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      full_name: 'Super Admin',
      role: 'super_admin',
    });
    console.log(`Super admin created: ${superAdminEmail}`);
  } catch (e) {
    console.log('Super admin already exists.');
  }

  console.log('Seed completed!');
  await app.close();
}
seed();
