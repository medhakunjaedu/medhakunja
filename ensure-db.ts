import { db } from "@/db";
import { sql } from "drizzle-orm";

let done = false;
export async function ensureDb() {
  if (done) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS settings (id SERIAL PRIMARY KEY, key TEXT NOT NULL UNIQUE, value TEXT NOT NULL DEFAULT '', updated_at TIMESTAMP DEFAULT NOW());
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS students (id SERIAL PRIMARY KEY, student_code TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL, wing TEXT NOT NULL DEFAULT 'school', branch TEXT NOT NULL DEFAULT '', class_name TEXT NOT NULL, shift TEXT NOT NULL DEFAULT '', version TEXT NOT NULL DEFAULT '', academic_year TEXT NOT NULL DEFAULT '2026', primary_contact TEXT NOT NULL, secondary_contact TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', father_name TEXT NOT NULL DEFAULT '', mother_name TEXT NOT NULL DEFAULT '', blood_group TEXT NOT NULL DEFAULT '', present_address TEXT NOT NULL DEFAULT '', monthly_fee INTEGER NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Active', dropped_date TEXT NOT NULL DEFAULT '', dropped_reason TEXT NOT NULL DEFAULT '', created_at TIMESTAMP DEFAULT NOW());
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, receipt_no TEXT NOT NULL UNIQUE, student_id INTEGER NOT NULL, posting_date TEXT NOT NULL, academic_year TEXT NOT NULL DEFAULT '2026', fee_months TEXT NOT NULL DEFAULT '', discount INTEGER NOT NULL DEFAULT 0, total_amount INTEGER NOT NULL DEFAULT 0, gross_amount INTEGER NOT NULL DEFAULT 0, remaining_due INTEGER NOT NULL DEFAULT 0, payment_mode TEXT NOT NULL DEFAULT 'Cash', transaction_id TEXT NOT NULL DEFAULT '', exam_name TEXT NOT NULL DEFAULT '', created_at TIMESTAMP DEFAULT NOW());
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_items (id SERIAL PRIMARY KEY, payment_id INTEGER NOT NULL, category TEXT NOT NULL, month TEXT NOT NULL DEFAULT '', amount INTEGER NOT NULL DEFAULT 0, exam_name TEXT NOT NULL DEFAULT '');
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS expenses (id SERIAL PRIMARY KEY, voucher_no TEXT NOT NULL UNIQUE, expense_date TEXT NOT NULL, wing TEXT NOT NULL DEFAULT 'General', paid_to TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', amount INTEGER NOT NULL DEFAULT 0, payment_mode TEXT NOT NULL DEFAULT 'Cash', academic_year TEXT NOT NULL DEFAULT '2026', created_at TIMESTAMP DEFAULT NOW());
  `);
  done = true;
}
