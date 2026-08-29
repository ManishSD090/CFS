import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  '20251219072241_init',
  '20251222053126_schema',
  '20251224134423_secha',
  '20251226062048_version',
  '20251226084418_schema',
  '20251227043623_payroll_of_worker_schema_version_1_5',
  '20251230050012_otp_verfication_version_1_6',
  '20251230073824_add_verification_fields',
  '20260307000000_add_transaction_module',
];

async function runBaseline() {
  console.log('🚀 Starting one-time production Prisma baseline...');

  for (const migration of migrations) {
    try {
      console.log(`📌 Marking migration as applied: ${migration}`);
      execSync(`npx prisma migrate resolve --applied ${migration}`, {
        stdio: 'inherit',
      });
    } catch (err) {
      console.warn(`⚠️ Warning: ${migration} might already be applied or failed to mark:`, err.message);
    }
  }

  console.log('🔍 Checking migration status...');
  try {
    execSync('npx prisma migrate status', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Migration status check encountered an issue:', err.message);
  }

  console.log('🌱 Seeding initial Super Admin...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Seed encountered an error:', err.message);
    process.exit(1);
  }

  console.log('✅ Baseline and Super Admin seed completed successfully!');
  console.log('🚀 Starting application server...');
  execSync('npm start', { stdio: 'inherit' });
}

runBaseline().catch((err) => {
  console.error('❌ Fatal error during baseline:', err);
  process.exit(1);
});
