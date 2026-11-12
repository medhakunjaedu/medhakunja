import { pgTable, serial, text, integer, timestamp, date } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentCode: text("student_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  wing: text("wing").notNull().default("school"), // school | coaching
  branch: text("branch").notNull().default(""),
  className: text("class_name").notNull(),
  shift: text("shift").notNull().default(""),
  version: text("version").notNull().default(""),
  academicYear: text("academic_year").notNull().default("2026"),
  primaryContact: text("primary_contact").notNull(),
  secondaryContact: text("secondary_contact").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  fatherName: text("father_name").notNull().default(""),
  motherName: text("mother_name").notNull().default(""),
  bloodGroup: text("blood_group").notNull().default(""),
  presentAddress: text("present_address").notNull().default(""),
  monthlyFee: integer("monthly_fee").notNull().default(0),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("Active"), // Active | Dropped
  droppedDate: text("dropped_date").notNull().default(""),
  droppedReason: text("dropped_reason").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  receiptNo: text("receipt_no").notNull().unique(),
  studentId: integer("student_id").notNull(),
  postingDate: text("posting_date").notNull(),
  academicYear: text("academic_year").notNull().default("2026"),
  feeMonths: text("fee_months").notNull().default(""),
  discount: integer("discount").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  grossAmount: integer("gross_amount").notNull().default(0),
  remainingDue: integer("remaining_due").notNull().default(0),
  paymentMode: text("payment_mode").notNull().default("Cash"),
  transactionId: text("transaction_id").notNull().default(""),
  examName: text("exam_name").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentItems = pgTable("payment_items", {
  id: serial("id").primaryKey(),
  paymentId: integer("payment_id").notNull(),
  category: text("category").notNull(),
  month: text("month").notNull().default(""),
  amount: integer("amount").notNull().default(0),
  examName: text("exam_name").notNull().default(""),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  voucherNo: text("voucher_no").notNull().unique(),
  expenseDate: text("expense_date").notNull(),
  wing: text("wing").notNull().default("General"), // School | Academic Care | General
  paidTo: text("paid_to").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  amount: integer("amount").notNull().default(0),
  paymentMode: text("payment_mode").notNull().default("Cash"),
  academicYear: text("academic_year").notNull().default("2026"),
  createdAt: timestamp("created_at").defaultNow(),
});
