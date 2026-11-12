import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = { title: "Medhakunja — Fee, Student & Accounting System", description: "Medhakunja Model School & Medhakunja Academic Care unified fee collection, student management and accounting system." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en"><body className="bg-[#F8FAFC] text-slate-900 antialiased">{children}</body></html>);
}
