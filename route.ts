import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@medhakunja.edu.bd";
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Medha@2026";
  if (String(email||"").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
    const res = NextResponse.json({ ok: true, email: ADMIN_EMAIL, name: "Principal / Admin" });
    res.cookies.set("mk_session", Buffer.from(ADMIN_EMAIL).toString("base64"), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60*60*24*7 });
    return res;
  }
  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}
