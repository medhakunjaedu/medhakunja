"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { LayoutDashboard, UserPlus, Users, Wallet, ReceiptText, TrendingUp, Landmark, MessageCircle, BarChart3, Settings as SettingsIcon, LogOut, GraduationCap, Search, Printer, Download, Copy, Check, X, Plus, Trash2, ChevronRight, ShieldCheck, Sparkles, ArrowUpCircle, Banknote, Phone, Mail, MapPin, BadgeCheck, FileText, Scissors } from "lucide-react";
import { SCHOOL_CLASSES, COACHING_CLASSES, SHIFTS, VERSIONS, MONTHS, FEE_CATEGORIES, PAYMENT_MODES, EXPENSE_CATEGORIES, BLOOD_GROUPS, YEARS, isJunior, classesForWing, nextClass, wingName, fmt, todayISO, waNumber, downloadCSV, downloadJSON, SCHOOL_NAME, COACHING_NAME, SCHOOL_ADDRESS, COACHING_BRANCHES, COACHING_ADDRESS_TEXT } from "@/lib/constants";
import { MoneyReceiptPrint, AdmitCardPrint, ExpenseVoucherPrint, type AnyPayment, type AnyExpense } from "@/components/printables";

type Student = { id:number; studentCode:string; fullName:string; wing:string; branch:string; className:string; shift:string; version:string; academicYear:string; primaryContact:string; secondaryContact:string; whatsapp:string; email:string; fatherName:string; motherName:string; bloodGroup:string; presentAddress:string; monthlyFee:number; notes:string; status:string; droppedDate:string; droppedReason:string; createdAt?:string };
type Payment = AnyPayment & { studentId?:number };
type Expense = AnyExpense;
type PrintState = { type:"receipt"|"admit"|"voucher"; payment?:Payment; expense?:Expense } | null;

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100";
const labelCls = "text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block";
const btnNavy = "bg-[#1E3A8A] hover:bg-[#162d6b] text-white font-bold rounded-xl px-4 py-2.5 text-sm inline-flex items-center gap-2 justify-center";
const btnGold = "bg-[#D97706] hover:bg-[#b45309] text-white font-bold rounded-xl px-4 py-2.5 text-sm inline-flex items-center gap-2 justify-center";

function fileToDataUrl(f: File, cb:(s:string)=>void){ const r=new FileReader(); r.onload=()=>cb(String(r.result)); r.readAsDataURL(f); }

export default function Home(){
  const [auth, setAuth] = useState<null|{email:string}>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState("dashboard");
  const [year, setYear] = useState("2026");
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [printState, setPrintState] = useState<PrintState>(null);
  const [preselectStudentId, setPreselectStudentId] = useState<number|null>(null);
  const [toast, setToast] = useState("");

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(""),3200); };

  const loadAll = useCallback(async(yr:string)=>{
    try{
      const [s,p,e,st] = await Promise.all([
        fetch(`/api/students?year=${yr}`).then(r=>r.json()),
        fetch(`/api/payments?year=${yr}`).then(r=>r.json()),
        fetch(`/api/expenses?year=${yr}`).then(r=>r.json()),
        fetch(`/api/settings`).then(r=>r.json()),
      ]);
      setStudents(Array.isArray(s)?s:[]); setPayments(Array.isArray(p)?p:[]); setExpenses(Array.isArray(e)?e:[]); setSettings(st||{});
    }catch{}
  },[]);

  useEffect(()=>{ fetch("/api/auth/me").then(r=>r.ok?r.json():null).then(d=>{ if(d?.authenticated) setAuth({email:d.email}); setAuthChecked(true); }).catch(()=>setAuthChecked(true)); },[]);
  useEffect(()=>{ if(auth) loadAll(year); },[auth, year, loadAll]);

  async function logout(){ await fetch("/api/auth/logout",{method:"POST"}); setAuth(null); }

  if(!authChecked) return <div className="min-h-screen grid place-items-center text-[#1E3A8A] font-bold">Loading Medhakunja System…</div>;
  if(!auth) return <LoginPage settings={settings} onLogin={(e)=>setAuth({email:e})} />;

  const nav = [
    {id:"dashboard", label:"Dashboard", icon:LayoutDashboard},
    {id:"admission", label:"New Admission", icon:UserPlus},
    {id:"students", label:"Students", icon:Users},
    {id:"collect", label:"Collect Fee", icon:Wallet},
    {id:"payments", label:"Payment History", icon:ReceiptText},
    {id:"promote", label:"Promote Students", icon:ArrowUpCircle},
    {id:"expenses", label:"Expenses", icon:Landmark},
    {id:"whatsapp", label:"WhatsApp Notices", icon:MessageCircle},
    {id:"reports", label:"Reports & Export", icon:BarChart3},
    {id:"settings", label:"Institution Settings", icon:SettingsIcon},
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="no-print w-[260px] shrink-0 bg-[#1E3A8A] text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl p-1.5 flex gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={settings.schoolLogo||"/images/school-logo.png"} className="w-9 h-9 object-contain" alt="school"/>
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={settings.coachingLogo||"/images/coaching-logo.png"} className="w-9 h-9 object-contain" alt="coaching"/>
            </div>
            <div><div className="font-extrabold leading-tight">MEDHAKUNJA</div><div className="text-[11px] text-blue-200">School • Academic Care</div></div>
          </div>
          <div className="mt-3 text-[11px] bg-white/10 rounded-lg px-2 py-1.5 flex items-center gap-1"><ShieldCheck size={13}/> Secure Admin Panel • No Public Sign-up</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(n=>{ const Icon=n.icon; const active=view===n.id; return <button key={n.id} onClick={()=>setView(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left ${active?"bg-[#D97706] text-white shadow":"text-blue-100 hover:bg-white/10"}`}><Icon size={18}/>{n.label}{active&&<ChevronRight size={16} className="ml-auto"/>}</button>; })}
        </nav>
        <div className="p-4 border-t border-white/15">
          <div className="text-xs text-blue-200">Logged in as</div><div className="text-sm font-bold truncate">{auth.email}</div>
          <button onClick={logout} className="mt-3 w-full bg-white text-[#1E3A8A] font-bold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="no-print sticky top-0 z-30 bg-white/90 backdrop-blur border-b px-4 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          <button className="lg:hidden bg-[#1E3A8A] text-white p-2 rounded-lg" onClick={()=>{ const el=document.getElementById("mobile-nav"); el?.classList.toggle("hidden"); }}><LayoutDashboard size={18}/></button>
          <div>
            <h1 className="font-extrabold text-[#1E3A8A] text-lg leading-tight">{nav.find(n=>n.id===view)?.label}</h1>
            <p className="text-xs text-slate-500">Medhakunja Model School & Medhakunja Academic Care • Mohammadpur, Dhaka</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <label className="text-xs font-bold text-slate-500">ACADEMIC SESSION</label>
            <select value={year} onChange={e=>setYear(e.target.value)} className="rounded-xl border-2 border-[#1E3A8A] text-[#1E3A8A] font-extrabold px-3 py-2 text-sm bg-blue-50">{YEARS.map(y=><option key={y}>{y}</option>)}</select>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> {students.filter(s=>s.status==="Active").length} Active in {year}</span>
            <button onClick={logout} className="lg:hidden text-red-600 font-bold text-sm flex gap-1 items-center"><LogOut size={16}/>Logout</button>
          </div>
          <div id="mobile-nav" className="hidden w-full lg:hidden flex flex-wrap gap-2 pt-2">{nav.map(n=><button key={n.id} onClick={()=>setView(n.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${view===n.id?"bg-[#D97706] text-white":"bg-slate-100"}`}>{n.label}</button>)}</div>
        </header>

        <main className="p-4 lg:p-8 max-w-[1400px] mx-auto">
          {view==="dashboard" && <Dashboard students={students} payments={payments} expenses={expenses} year={year} go={setView} onSeed={async()=>{ await fetch("/api/seed",{method:"POST"}); loadAll(year); showToast("Sample data loaded"); }} hasData={students.length>0} />}
          {view==="admission" && <AdmissionForm year={year} settings={settings} onSaved={()=>loadAll(year)} setPrint={setPrintState} showToast={showToast} />}
          {view==="students" && <StudentsView students={students} payments={payments} year={year} reload={()=>loadAll(year)} setPrint={setPrintState} collect={(id)=>{ setPreselectStudentId(id); setView("collect"); }} showToast={showToast} />}
          {view==="collect" && <CollectFee students={students} year={year} preselectId={preselectStudentId} onSaved={()=>loadAll(year)} setPrint={setPrintState} showToast={showToast} />}
          {view==="payments" && <PaymentsView payments={payments} setPrint={setPrintState} />}
          {view==="promote" && <PromoteView students={students} year={year} reload={()=>loadAll(year)} showToast={showToast} />}
          {view==="expenses" && <ExpensesView expenses={expenses} year={year} settings={settings} reload={()=>loadAll(year)} setPrint={setPrintState} showToast={showToast} />}
          {view==="whatsapp" && <WhatsAppView students={students} payments={payments} />}
          {view==="reports" && <ReportsView students={students} payments={payments} expenses={expenses} year={year} setPrint={setPrintState} />}
          {view==="settings" && <SettingsView settings={settings} setSettings={setSettings} showToast={showToast} onSeed={async()=>{ const r=await fetch("/api/seed",{method:"POST"}); const d=await r.json(); showToast(d.message||"Sample data loaded"); loadAll(year); }} />}
        </main>
        <footer className="no-print text-center text-xs text-slate-400 pb-8 px-4">Medhakunja Unified System • {SCHOOL_ADDRESS} • Data stored securely in PostgreSQL cloud database • Print receipts on A4</footer>
      </div>

      {toast && <div className="no-print fixed bottom-5 right-5 z-[90] bg-[#1E3A8A] text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex gap-2 items-center"><Check size={18}/>{toast}</div>}

      {printState && (
        <div className="fixed inset-0 z-[80] bg-black/60 overflow-y-auto p-3 lg:p-6">
          <div className="no-print max-w-[900px] mx-auto flex gap-2 justify-end mb-3 sticky top-0">
            <button onClick={()=>window.print()} className={btnGold}><Printer size={17}/> Print / Save PDF</button>
            {printState.type==="receipt" && printState.payment && (printState.payment.examName || printState.payment.items.some(i=>i.category==="Exam Fee")) && <button onClick={()=>setPrintState({type:"admit", payment:printState.payment})} className={btnNavy}><GraduationCap size={17}/> Print Admit Card</button>}
            {printState.type==="admit" && printState.payment && <button onClick={()=>setPrintState({type:"receipt", payment:printState.payment})} className="bg-white font-bold rounded-xl px-4 py-2.5 text-sm">Back to Receipt</button>}
            <button onClick={()=>setPrintState(null)} className="bg-white font-bold rounded-xl px-3 py-2.5"><X size={17}/></button>
          </div>
          <div id="print-root" className="max-w-[900px] mx-auto bg-white rounded-xl shadow-2xl p-3 lg:p-5 overflow-x-auto">
            {printState.type==="receipt" && printState.payment && <MoneyReceiptPrint payment={printState.payment} settings={settings} />}
            {printState.type==="admit" && printState.payment && <AdmitCardPrint payment={printState.payment} settings={settings} />}
            {printState.type==="voucher" && printState.expense && <ExpenseVoucherPrint expense={printState.expense} settings={settings} />}
            <p className="no-print text-center text-xs text-slate-400 mt-3">Tip: In print dialog choose A4, margins “Minimum/None”, scale 100% — receipt fits on ONE A4 page with Student + Office copies.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= LOGIN ================= */
function LoginPage({ settings, onLogin }:{ settings:Record<string,string>; onLogin:(e:string)=>void }){
  const [email,setEmail]=useState("admin@medhakunja.edu.bd"); const [password,setPassword]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:React.FormEvent){ e.preventDefault(); setLoading(true); setErr(""); const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const d=await r.json(); setLoading(false); if(!r.ok){ setErr(d.error||"Login failed"); return; } onLogin(d.email); }
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" style={{backgroundImage:"radial-gradient(circle at 20% 20%, #DBEAFE 0, transparent 40%), radial-gradient(circle at 80% 80%, #FEF3C7 0, transparent 40%)"}}>
      <div className="w-full max-w-[520px]">
        <div className="bg-white rounded-[28px] shadow-2xl border overflow-hidden">
          <div className="bg-[#1E3A8A] text-white p-6 text-center">
            <div className="flex justify-center items-center gap-4">
              <div className="bg-white rounded-2xl p-2 text-center"><img src={settings.schoolLogo||"/images/school-logo.png"} className="w-16 h-16 object-contain" alt="School"/><div className="text-[#1E3A8A] text-[9px] font-extrabold mt-1 max-w-[90px] leading-tight">MEDHAKUNJA MODEL SCHOOL</div></div>
              <div className="text-[#D97706] font-black text-2xl">+</div>
              <div className="bg-white rounded-2xl p-2 text-center"><img src={settings.coachingLogo||"/images/coaching-logo.png"} className="w-16 h-16 object-contain" alt="Coaching"/><div className="text-[#1E3A8A] text-[9px] font-extrabold mt-1 max-w-[90px] leading-tight">MEDHAKUNJA ACADEMIC CARE</div></div>
            </div>
            <h1 className="font-extrabold text-xl mt-4">Fee • Student • Accounting System</h1>
            <p className="text-blue-200 text-xs mt-1 flex items-center justify-center gap-1"><MapPin size={12}/> Mohammadpur, Dhaka-1207 • Secure Admin Login Only</p>
          </div>
          <form onSubmit={submit} className="p-6 lg:p-8 space-y-4">
            <div><label className={labelCls}>Admin Email</label><input className={inputCls} value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="admin@medhakunja.edu.bd"/></div>
            <div><label className={labelCls}>Password</label><input className={inputCls} value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="••••••••"/></div>
            {err && <div className="bg-red-50 text-red-700 text-sm font-semibold rounded-xl px-3 py-2">{err}</div>}
            <button disabled={loading} className="w-full bg-[#1E3A8A] hover:bg-[#162d6b] disabled:opacity-60 text-white font-extrabold rounded-xl py-3.5 flex items-center justify-center gap-2"><ShieldCheck size={18}/>{loading?"Signing in…":"Login to Admin Panel"}</button>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <b>Demo Admin Access (change via ADMIN_EMAIL / ADMIN_PASSWORD env):</b><br/>Email: <b>admin@medhakunja.edu.bd</b> &nbsp;•&nbsp; Password: <b>Medha@2026</b><br/><span className="text-amber-700">Public sign-up is disabled. Only authorized admins can access.</span>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">© Medhakunja • School & Coaching unified system • Host free on Vercel + PostgreSQL</p>
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */
function StatCard({ title, value, sub, gold }:{ title:string; value:string; sub:string; gold?:boolean }){
  return <div className="bg-white rounded-2xl border shadow-sm p-5"><div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</div><div className={`text-[26px] font-extrabold mt-1 ${gold?"text-[#D97706]":"text-[#1E3A8A]"}`}>{value}</div><div className="text-xs text-slate-500 mt-1">{sub}</div></div>;
}
function Dashboard({ students, payments, expenses, year, go, onSeed, hasData }:{ students:Student[]; payments:Payment[]; expenses:Expense[]; year:string; go:(v:string)=>void; onSeed:()=>void; hasData:boolean }){
  const now = new Date(); const curMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`; const curMonthName = MONTHS[now.getMonth()];
  const [month, setMonth] = useState(curMonth); const [from,setFrom]=useState(""); const [to,setTo]=useState("");
  const monthName = MONTHS[parseInt(month.slice(5,7))-1] || curMonthName;
  const active = students.filter(s=>s.status==="Active"); const dropped = students.filter(s=>s.status==="Dropped");
  const split=(arr:Student[])=>({ school:arr.filter(s=>s.wing==="school").length, coaching:arr.filter(s=>s.wing==="coaching").length });
  const newThisMonth = students.filter(s=>(s.createdAt||"").startsWith(month));
  const paidIds = new Set(payments.filter(p=> (p.feeMonths||"").includes(monthName) || (p.postingDate||"").startsWith(month)).map(p=>p.student?.id));
  const paidActive = active.filter(s=>paidIds.has(s.id)); const unpaidActive = active.filter(s=>!paidIds.has(s.id));
  const inRange=(d:string)=>{ if(from && d<from) return false; if(to && d>to) return false; return true; };
  const today = todayISO();
  const collToday = payments.filter(p=>p.postingDate===today && inRange(p.postingDate)); const collMonth = payments.filter(p=>(p.postingDate||"").startsWith(month) && inRange(p.postingDate));
  const sum=(arr:Payment[])=>arr.reduce((a,p)=>a+(p.totalAmount||0),0);
  const byWing=(arr:Payment[],w:string)=>arr.filter(p=>p.student?.wing===w).reduce((a,p)=>a+(p.totalAmount||0),0);
  const expToday = expenses.filter(e=>e.expenseDate===today); const expMonth = expenses.filter(e=>(e.expenseDate||"").startsWith(month));
  const expSum=(arr:Expense[])=>arr.reduce((a,e)=>a+(e.amount||0),0);
  const totalColl = sum(payments); const totalExp = expSum(expenses);
  const recent = payments.slice(0,6);
  return (
    <div className="space-y-6">
      {!hasData && <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-3xl p-6 flex flex-wrap gap-4 items-center justify-between"><div><h2 className="font-extrabold text-xl flex gap-2 items-center"><Sparkles/> Welcome! Start with sample data or add your first student.</h2><p className="text-blue-100 text-sm mt-1">Sample data includes School + Academic Care students, fee collections with Exam Fee & expenses for {year}.</p></div><div className="flex gap-2"><button onClick={onSeed} className={btnGold}>Load Sample Data</button><button onClick={()=>go("admission")} className="bg-white text-[#1E3A8A] font-bold rounded-xl px-4 py-2.5 text-sm">+ New Admission</button></div></div>}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-end">
        <div><label className={labelCls}>Report Month</label><input type="month" className={inputCls} value={month} onChange={e=>setMonth(e.target.value)}/></div>
        <div><label className={labelCls}>From Date</label><input type="date" className={inputCls} value={from} onChange={e=>setFrom(e.target.value)}/></div>
        <div><label className={labelCls}>To Date</label><input type="date" className={inputCls} value={to} onChange={e=>setTo(e.target.value)}/></div>
        <button onClick={()=>{setFrom("");setTo("");}} className="bg-slate-100 font-bold rounded-xl px-4 py-2.5 text-sm">Clear Range</button>
        <span className="ml-auto text-sm font-bold text-[#1E3A8A]">Session: {year} • Month: {monthName}</span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Active Students" value={String(active.length)} sub={`School: ${split(active).school} • Academic Care: ${split(active).coaching}`} />
        <StatCard title="New Admissions (Month)" value={String(newThisMonth.length)} sub={`School: ${split(newThisMonth).school} • Academic Care: ${split(newThisMonth).coaching}`} />
        <StatCard title="Dropped Students" value={String(dropped.length)} sub={`School: ${split(dropped).school} • Academic Care: ${split(dropped).coaching}`} />
        <StatCard title={`Paid vs Unpaid (${monthName})`} value={`${paidActive.length} / ${unpaidActive.length}`} sub={`Paid School ${paidActive.filter(s=>s.wing==="school").length} • Paid Coaching ${paidActive.filter(s=>s.wing==="coaching").length} • Unpaid School ${unpaidActive.filter(s=>s.wing==="school").length} • Unpaid Coaching ${unpaidActive.filter(s=>s.wing==="coaching").length}`} />
        <StatCard title="Collection Today" value={`৳${fmt(sum(collToday))}`} sub={`School ৳${fmt(byWing(collToday,"school"))} • Coaching ৳${fmt(byWing(collToday,"coaching"))}`} gold />
        <StatCard title="Collection This Month" value={`৳${fmt(sum(collMonth))}`} sub={`School ৳${fmt(byWing(collMonth,"school"))} • Coaching ৳${fmt(byWing(collMonth,"coaching"))}`} gold />
        <StatCard title="Expenses Today / Month" value={`৳${fmt(expSum(expToday))} / ৳${fmt(expSum(expMonth))}`} sub={`${expMonth.length} expense(s) this month`} />
        <StatCard title="Net Cash in Hand / Balance" value={`৳${fmt(totalColl-totalExp)}`} sub={`Month Net: ৳${fmt(sum(collMonth)-expSum(expMonth))} • Total Collection ৳${fmt(totalColl)} − Expenses ৳${fmt(totalExp)}`} gold />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border p-5">
          <div className="flex justify-between items-center"><h3 className="font-extrabold text-[#1E3A8A]">Recent Collections</h3><button onClick={()=>go("payments")} className="text-[#D97706] font-bold text-sm">View All →</button></div>
          <div className="mt-3 space-y-2">{recent.length===0 && <p className="text-sm text-slate-400">No payments yet in {year}.</p>}{recent.map(p=><div key={p.id} className="flex justify-between bg-slate-50 rounded-xl px-3 py-2.5 text-sm"><span><b>{p.student?.fullName||"Student"}</b> <span className="text-slate-400">• {p.receiptNo} • {p.postingDate}</span></span><b className="text-[#1E3A8A]">৳{fmt(p.totalAmount)}</b></div>)}</div>
        </div>
        <div className="lg:col-span-2 bg-[#1E3A8A] text-white rounded-2xl p-5">
          <h3 className="font-extrabold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[["admission","+ New Admission"],["collect","Collect Fee"],["expenses","Add Expense"],["whatsapp","WhatsApp Notice"],["promote","Promote Students"],["reports","Reports & Backup"]].map(([v,l])=><button key={v} onClick={()=>go(v)} className="bg-white/10 hover:bg-[#D97706] rounded-xl px-3 py-3 text-sm font-bold text-left">{l}</button>)}
          </div>
          <div className="mt-4 bg-white/10 rounded-xl p-3 text-xs leading-relaxed"><b>Wing Addresses</b><br/>{SCHOOL_NAME}: {SCHOOL_ADDRESS}<br/>{COACHING_NAME}: {COACHING_ADDRESS_TEXT}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= ADMISSION ================= */
function AdmissionForm({ year, settings, onSaved, setPrint, showToast }:{ year:string; settings:Record<string,string>; onSaved:()=>void; setPrint:(p:PrintState)=>void; showToast:(m:string)=>void }){
  const [f,setF]=useState({ wing:"school", branch:COACHING_BRANCHES[0], className:"Play Group", shift:"Morning Shift", version:"Bangla Version", fullName:"", primaryContact:"", secondaryContact:"", whatsapp:"", email:"", fatherName:"", motherName:"", bloodGroup:"", presentAddress:"", monthlyFee:"", notes:"" });
  const [same,setSame]=useState(true); const [savedStudent,setSavedStudent]=useState<Student|null>(null); const [bill,setBill]=useState({admission:"5000", form:"500", firstMonth:""}); const [saving,setSaving]=useState(false);
  const junior = isJunior(f.className);
  function setWing(w:string){ const cls = classesForWing(w)[0]; setF({...f, wing:w, className:cls, shift:"Morning Shift", version:"Bangla Version"}); }
  function setClass(c:string){ setF({...f, className:c}); }
  async function submit(e:React.FormEvent){ e.preventDefault(); if(junior && !f.shift) return alert("Shift is required for Play Group / Nursery / KG"); if(!junior && !f.version) return alert("Version is required for this class"); setSaving(true);
    const payload={...f, academicYear:year, monthlyFee:Number(f.monthlyFee||0), whatsapp: same? f.primaryContact : f.whatsapp, shift: junior? f.shift : "", version: junior? "" : f.version, branch: f.wing==="coaching"? f.branch : ""};
    const r=await fetch("/api/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const d=await r.json(); setSaving(false);
    if(!r.ok) return alert(d.error||"Failed to save");
    setSavedStudent(d); setBill(b=>({...b, firstMonth: String(d.monthlyFee||f.monthlyFee||"")})); onSaved(); showToast(`Admission saved! Student ID: ${d.studentCode}`);
  }
  async function generateAdmissionReceipt(){
    if(!savedStudent) return;
    const items=[{category:"Admission Fee",month:"",amount:Number(bill.admission||0)},{category:"Form Fee",month:"",amount:Number(bill.form||0)},{category:"Tuition Fee",month:MONTHS[new Date().getMonth()],amount:Number(bill.firstMonth||0)}].filter(i=>i.amount>0);
    const r=await fetch("/api/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:savedStudent.id, postingDate:todayISO(), academicYear:year, feeMonths:MONTHS[new Date().getMonth()], items, discount:0, remainingDue:0, paymentMode:"Cash"})});
    const d=await r.json(); onSaved(); setPrint({type:"receipt", payment:{...d, student: d.student||savedStudent}}); showToast("Admission money receipt generated");
  }
  return (
    <div className="grid lg:grid-cols-3 gap-5 items-start">
      <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-3xl border p-6 space-y-4">
        <div className="flex gap-2">
          <button type="button" onClick={()=>setWing("school")} className={`flex-1 rounded-2xl border-2 p-3 text-left ${f.wing==="school"?"border-[#1E3A8A] bg-blue-50":"border-slate-200"}`}><img src={settings.schoolLogo||"/images/school-logo.png"} className="w-10 h-10 object-contain" alt=""/><b className="text-sm text-[#1E3A8A]">{SCHOOL_NAME}</b><div className="text-[11px] text-slate-500">{SCHOOL_ADDRESS}</div></button>
          <button type="button" onClick={()=>setWing("coaching")} className={`flex-1 rounded-2xl border-2 p-3 text-left ${f.wing==="coaching"?"border-[#D97706] bg-amber-50":"border-slate-200"}`}><img src={settings.coachingLogo||"/images/coaching-logo.png"} className="w-10 h-10 object-contain" alt=""/><b className="text-sm text-[#1E3A8A]">{COACHING_NAME}</b><div className="text-[11px] text-slate-500">2 Branches • Mohammadpur</div></button>
        </div>
        {f.wing==="coaching" && <div><label className={labelCls}>Branch *</label><select className={inputCls} value={f.branch} onChange={e=>setF({...f,branch:e.target.value})}>{COACHING_BRANCHES.map(b=><option key={b}>{b}</option>)}</select></div>}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-semibold text-[#1E3A8A]">Student ID will be auto-generated (e.g. {f.wing==="coaching"?"MAC":"MMS"}-{year}-0001) • Academic Year: <b>{year}</b> (change from top selector)</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className={labelCls}>Student Full Name *</label><input className={inputCls} required value={f.fullName} onChange={e=>setF({...f,fullName:e.target.value})} placeholder="e.g. Ayesha Rahman"/></div>
          <div><label className={labelCls}>Class / Batch *</label><select className={inputCls} value={f.className} onChange={e=>setClass(e.target.value)}>{classesForWing(f.wing).map(c=><option key={c}>{c}</option>)}</select></div>
          {junior ? <div><label className={labelCls}>Shift * (Required for {f.className})</label><select className={inputCls} required value={f.shift} onChange={e=>setF({...f,shift:e.target.value})}>{SHIFTS.map(s=><option key={s}>{s}</option>)}</select><p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Version hidden — not applicable for junior classes</p></div>
          : <div><label className={labelCls}>Version * (Required)</label><select className={inputCls} required value={f.version} onChange={e=>setF({...f,version:e.target.value})}>{VERSIONS.map(v=><option key={v}>{v}</option>)}</select><p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Shift hidden — not applicable for this class</p></div>}
          <div><label className={labelCls}>Primary Contact Number *</label><input className={inputCls} required value={f.primaryContact} onChange={e=>setF({...f,primaryContact:e.target.value, whatsapp: same? e.target.value : f.whatsapp})} placeholder="01XXXXXXXXX"/></div>
          <div><label className={labelCls}>Secondary Contact Number *</label><input className={inputCls} required value={f.secondaryContact} onChange={e=>setF({...f,secondaryContact:e.target.value})} placeholder="01XXXXXXXXX"/></div>
          <div><label className={labelCls}>WhatsApp Number *</label><input className={inputCls} required disabled={same} value={same? f.primaryContact : f.whatsapp} onChange={e=>setF({...f,whatsapp:e.target.value})} placeholder="01XXXXXXXXX"/><label className="flex gap-2 items-center text-xs font-semibold mt-1.5"><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Same as Primary Contact</label></div>
          <div><label className={labelCls}>Email Address *</label><input className={inputCls} required type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="parent@gmail.com"/></div>
          <div><label className={labelCls}>Father's Name</label><input className={inputCls} value={f.fatherName} onChange={e=>setF({...f,fatherName:e.target.value})}/></div>
          <div><label className={labelCls}>Mother's Name</label><input className={inputCls} value={f.motherName} onChange={e=>setF({...f,motherName:e.target.value})}/></div>
          <div><label className={labelCls}>Blood Group</label><select className={inputCls} value={f.bloodGroup} onChange={e=>setF({...f,bloodGroup:e.target.value})}><option value="">Select</option>{BLOOD_GROUPS.map(b=><option key={b}>{b}</option>)}</select></div>
          <div><label className={labelCls}>Monthly Tuition Fee Amount (BDT)</label><input className={inputCls} type="number" value={f.monthlyFee} onChange={e=>setF({...f,monthlyFee:e.target.value})} placeholder="e.g. 4500"/></div>
          <div className="md:col-span-2"><label className={labelCls}>Present Address</label><input className={inputCls} value={f.presentAddress} onChange={e=>setF({...f,presentAddress:e.target.value})}/></div>
          <div className="md:col-span-2"><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></div>
        </div>
        <button disabled={saving} className={btnNavy+" w-full !py-3.5"}><UserPlus size={18}/>{saving?"Saving…":"Save Admission"}</button>
      </form>
      <div className="space-y-4">
        <div className="bg-[#1E3A8A] text-white rounded-3xl p-5"><h3 className="font-extrabold flex gap-2 items-center"><BadgeCheck/> Admission Rules</h3><ul className="text-xs text-blue-100 space-y-2 mt-2 leading-relaxed"><li>• Play Group / Nursery / KG → <b className="text-white">Shift required, Version hidden</b></li><li>• Class 1–10 & Intermediate → <b className="text-white">Version required, Shift hidden</b></li><li>• School classes: Play Group–Class 10 • Coaching: Class 3–Intermediate 2nd Year</li><li>• After saving, generate Admission Receipt instantly →</li></ul></div>
        {savedStudent && <div className="bg-white rounded-3xl border-2 border-emerald-300 p-5 space-y-3"><div className="text-emerald-700 font-extrabold flex gap-2"><Check/> Admission Saved!</div><div className="text-sm"><b>{savedStudent.fullName}</b><br/><span className="text-slate-500">ID: {savedStudent.studentCode} • {savedStudent.className} • {savedStudent.shift||savedStudent.version}</span></div>
          <div><label className={labelCls}>Admission Fee (BDT)</label><input type="number" className={inputCls} value={bill.admission} onChange={e=>setBill({...bill,admission:e.target.value})}/></div>
          <div><label className={labelCls}>Form Fee (BDT)</label><input type="number" className={inputCls} value={bill.form} onChange={e=>setBill({...bill,form:e.target.value})}/></div>
          <div><label className={labelCls}>First Month Tuition Fee (BDT)</label><input type="number" className={inputCls} value={bill.firstMonth} onChange={e=>setBill({...bill,firstMonth:e.target.value})}/></div>
          <button onClick={generateAdmissionReceipt} className={btnGold+" w-full"}><ReceiptText size={17}/> Generate Admission Money Receipt</button>
          <button onClick={()=>{setSavedStudent(null); setF({...f,fullName:"",primaryContact:"",secondaryContact:"",whatsapp:"",email:""});}} className="w-full bg-slate-100 font-bold rounded-xl py-2.5 text-sm">+ Admit Another Student</button>
        </div>}
      </div>
    </div>
  );
}

/* ================= STUDENTS ================= */
function StudentsView({ students, payments, year, reload, setPrint, collect, showToast }:{ students:Student[]; payments:Payment[]; year:string; reload:()=>void; setPrint:(p:PrintState)=>void; collect:(id:number)=>void; showToast:(m:string)=>void }){
  const [q,setQ]=useState(""); const [wing,setWing]=useState("all"); const [cls,setCls]=useState("all"); const [status,setStatus]=useState("all");
  const [historyStudent,setHistoryStudent]=useState<Student|null>(null); const [dropStudent,setDropStudent]=useState<Student|null>(null); const [dropDate,setDropDate]=useState(todayISO()); const [dropReason,setDropReason]=useState("");
  const filtered = students.filter(s=>{
    const query=q.trim().toLowerCase();
    const matchQ=!query || s.fullName.toLowerCase().includes(query)||s.studentCode.toLowerCase().includes(query)||s.primaryContact.includes(query)||s.whatsapp.includes(query)||(s.secondaryContact||"").includes(query);
    return matchQ && (wing==="all"||s.wing===wing) && (cls==="all"||s.className===cls) && (status==="all"||s.status===status);
  });
  async function doDrop(){ if(!dropStudent) return; await fetch(`/api/students/${dropStudent.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"Dropped",droppedDate:dropDate,droppedReason:dropReason})}); setDropStudent(null); reload(); showToast("Student marked as Dropped"); }
  async function reactivate(s:Student){ await fetch(`/api/students/${s.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"Active",droppedDate:"",droppedReason:""})}); reload(); showToast("Student reactivated"); }
  const histPays = historyStudent ? payments.filter(p=>p.student?.id===historyStudent.id) : [];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input className={inputCls+" pl-9"} placeholder="Instant search by Name, Student ID, Contact / WhatsApp…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <select className="rounded-xl border px-3 py-2.5 text-sm font-semibold" value={wing} onChange={e=>setWing(e.target.value)}><option value="all">Both Wings</option><option value="school">Medhakunja Model School</option><option value="coaching">Medhakunja Academic Care</option></select>
        <select className="rounded-xl border px-3 py-2.5 text-sm font-semibold" value={cls} onChange={e=>setCls(e.target.value)}><option value="all">All Classes</option>{[...SCHOOL_CLASSES,...COACHING_CLASSES.filter(c=>!SCHOOL_CLASSES.includes(c))].map(c=><option key={c}>{c}</option>)}</select>
        <select className="rounded-xl border px-3 py-2.5 text-sm font-semibold" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All Status</option><option>Active</option><option>Dropped</option></select>
        <button onClick={()=>downloadCSV(`students-${year}.csv`,[["Student ID","Name","Wing","Branch","Class","Shift/Version","Primary","WhatsApp","Email","Monthly Fee","Status"],...filtered.map(s=>[s.studentCode,s.fullName,wingName(s.wing),s.branch,s.className,s.shift||s.version,s.primaryContact,s.whatsapp,s.email,String(s.monthlyFee),s.status])])} className={btnNavy}><Download size={16}/> Export CSV</button>
      </div>
      <div className="bg-white rounded-3xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[900px]"><thead><tr className="bg-[#1E3A8A] text-white text-left"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Class • Shift/Version</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Monthly Fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
      <tbody>{filtered.map(s=><tr key={s.id} className="border-t hover:bg-blue-50/50"><td className="px-4 py-3"><b>{s.fullName}</b><div className="text-xs text-slate-500">{s.studentCode} • {s.wing==="coaching"?"Academic Care":"School"}{s.branch?` • ${s.branch}`:""}</div></td><td className="px-4 py-3">{s.className}<div className="text-xs text-slate-500">{s.shift||s.version}</div></td><td className="px-4 py-3">{s.primaryContact}<div className="text-xs text-slate-500">WA: {s.whatsapp}</div></td><td className="px-4 py-3 font-bold">৳{fmt(s.monthlyFee||0)}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status==="Active"?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>{s.status}</span>{s.status==="Dropped"&&<div className="text-[11px] text-red-500">{s.droppedDate} • {s.droppedReason}</div>}</td>
      <td className="px-4 py-3"><div className="flex gap-1.5 flex-wrap"><button onClick={()=>collect(s.id)} className="bg-[#D97706] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Collect Fee</button><button onClick={()=>setHistoryStudent(s)} className="bg-[#1E3A8A] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">History</button><a target="_blank" href={`https://wa.me/${waNumber(s.whatsapp||s.primaryContact)}`} className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">WhatsApp</a>{s.status==="Active"?<button onClick={()=>setDropStudent(s)} className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200">Drop</button>:<button onClick={()=>reactivate(s)} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200">Reactivate</button>}</div></td></tr>)}
      {filtered.length===0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No students found for session {year}. Try another search or add admission.</td></tr>}</tbody></table></div>
      <div className="px-4 py-3 bg-slate-50 text-xs font-semibold text-slate-500">Showing {filtered.length} of {students.length} students • Session {year}</div></div>

      {historyStudent && <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"><div className="flex justify-between"><div><h3 className="font-extrabold text-[#1E3A8A] text-lg">{historyStudent.fullName}</h3><p className="text-xs text-slate-500">{historyStudent.studentCode} • {historyStudent.className} • {historyStudent.shift||historyStudent.version} • {historyStudent.primaryContact}</p></div><button onClick={()=>setHistoryStudent(null)}><X/></button></div>
      <div className="mt-4 space-y-2">{histPays.length===0&&<p className="text-sm text-slate-400">No payments yet.</p>}{histPays.map(p=><div key={p.id} className="border rounded-2xl p-3 flex flex-wrap gap-2 items-center justify-between"><div className="text-sm"><b>{p.receiptNo}</b> • {p.postingDate} • {p.feeMonths}<div className="text-xs text-slate-500">{p.items.map(i=>`${i.category}${i.category==="Exam Fee"&&p.examName?` (${p.examName})`:""} ৳${fmt(i.amount)}`).join(" • ")}</div></div><div className="flex gap-1.5 items-center"><b>৳{fmt(p.totalAmount)}</b><button onClick={()=>setPrint({type:"receipt",payment:p})} className="bg-[#1E3A8A] text-white text-xs font-bold px-2 py-1.5 rounded-lg flex gap-1"><Printer size={13}/> Receipt</button>{(p.examName||p.items.some(i=>i.category==="Exam Fee"))&&<button onClick={()=>setPrint({type:"admit",payment:p})} className="bg-[#D97706] text-white text-xs font-bold px-2 py-1.5 rounded-lg">Admit Card</button>}</div></div>)}</div></div></div>}
      {dropStudent && <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-3"><h3 className="font-extrabold text-red-600">Mark as Dropped — {dropStudent.fullName}</h3><div><label className={labelCls}>Dropped Date</label><input type="date" className={inputCls} value={dropDate} onChange={e=>setDropDate(e.target.value)}/></div><div><label className={labelCls}>Reason</label><input className={inputCls} value={dropReason} onChange={e=>setDropReason(e.target.value)} placeholder="e.g. Left institution / Shifted"/></div><div className="flex gap-2"><button onClick={doDrop} className="flex-1 bg-red-600 text-white font-bold rounded-xl py-2.5 text-sm">Confirm Drop</button><button onClick={()=>setDropStudent(null)} className="flex-1 bg-slate-100 font-bold rounded-xl py-2.5 text-sm">Cancel</button></div></div></div>}
    </div>
  );
}

/* ================= COLLECT FEE ================= */
function CollectFee({ students, year, preselectId, onSaved, setPrint, showToast }:{ students:Student[]; year:string; preselectId:number|null; onSaved:()=>void; setPrint:(p:PrintState)=>void; showToast:(m:string)=>void }){
  const activeStudents = students.filter(s=>s.status==="Active");
  const [q,setQ]=useState(""); const [studentId,setStudentId]=useState<number|null>(preselectId);
  useEffect(()=>{ if(preselectId) setStudentId(preselectId); },[preselectId]);
  const [postingDate,setPostingDate]=useState(todayISO()); const [selectedMonths,setSelectedMonths]=useState<string[]>([MONTHS[new Date().getMonth()]]); const [manualMonth,setManualMonth]=useState("");
  const [items,setItems]=useState<{category:string;amount:string}[]>([{category:"Tuition Fee",amount:""}]);
  const [examName,setExamName]=useState(""); const [discount,setDiscount]=useState("0"); const [remainingDue,setRemainingDue]=useState("0"); const [mode,setMode]=useState("Cash"); const [txn,setTxn]=useState(""); const [saving,setSaving]=useState(false); const [lastPayment,setLastPayment]=useState<Payment|null>(null);
  const student = activeStudents.find(s=>s.id===studentId)||null;
  const searchResults = activeStudents.filter(s=>{ const query=q.toLowerCase(); return !query||s.fullName.toLowerCase().includes(query)||s.studentCode.toLowerCase().includes(query)||s.primaryContact.includes(query)||s.whatsapp.includes(query); }).slice(0,8);
  const gross = items.reduce((a,i)=>a+Number(i.amount||0),0); const total = Math.max(0,gross-Number(discount||0));
  const hasExam = items.some(i=>i.category==="Exam Fee");
  function toggleMonth(m:string){ setSelectedMonths(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m]); }
  async function submit(){
    if(!student) return alert("Please search & select a student first");
    if(items.some(i=>!i.amount||Number(i.amount)<=0)) return alert("Enter amount for each fee item");
    if(hasExam && !examName.trim()) return alert("Exam Name is required when Exam Fee is selected (e.g. 1st Terminal Exam 2026)");
    const feeMonths = [...selectedMonths, ...(manualMonth.trim()?[manualMonth.trim()]:[])].join(", ");
    setSaving(true);
    const payload={ studentId:student.id, postingDate, academicYear:year, feeMonths, discount:Number(discount||0), remainingDue:Number(remainingDue||0), paymentMode:mode, transactionId:(mode==="Cash"?"":txn), examName: hasExam? examName:"", items: items.map(i=>({category:i.category, amount:Number(i.amount||0), month:feeMonths, examName: i.category==="Exam Fee"? examName:""})) };
    const r=await fetch("/api/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const d=await r.json(); setSaving(false);
    if(!r.ok) return alert(d.error||"Failed to save payment");
    const pay={...d, student:d.student||student}; setLastPayment(pay); onSaved(); showToast(`Payment saved! Receipt ${d.receiptNo}`);
    setPrint({type:"receipt", payment:pay});
  }
  return (
    <div className="grid lg:grid-cols-3 gap-5 items-start">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-3xl border p-5">
          <label className={labelCls}>Search & Select Student *</label>
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input className={inputCls+" pl-9"} placeholder="Search by Name, ID, Contact / WhatsApp…" value={q} onChange={e=>{setQ(e.target.value);}}/></div>
          {q && !student && <div className="mt-2 border rounded-2xl overflow-hidden">{searchResults.map(s=><button key={s.id} onClick={()=>{setStudentId(s.id); setQ(s.fullName); setItems([{category:"Tuition Fee", amount:String(s.monthlyFee||"")}]);}} className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b last:border-0 text-sm"><b>{s.fullName}</b> <span className="text-slate-500">• {s.studentCode} • {s.className} • {s.shift||s.version} • {s.primaryContact} • {s.wing==="coaching"?"Academic Care":"School"}</span></button>)}{searchResults.length===0&&<p className="px-3 py-3 text-sm text-slate-400">No active student found</p>}</div>}
          {student && <div className="mt-3 bg-[#1E3A8A] text-white rounded-2xl p-4 flex justify-between gap-3"><div><b className="text-lg">{student.fullName}</b><div className="text-blue-200 text-xs">{student.studentCode} • {wingName(student.wing)} • {student.className} • {student.shift||student.version} • {student.primaryContact}</div></div><button onClick={()=>{setStudentId(null); setQ("");}} className="bg-white/20 rounded-lg px-2 py-1 text-xs font-bold h-fit">Change</button></div>}
        </div>
        <div className="bg-white rounded-3xl border p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Posting Date *</label><input type="date" className={inputCls} value={postingDate} onChange={e=>setPostingDate(e.target.value)}/></div>
            <div><label className={labelCls}>Mode of Payment *</label><select className={inputCls} value={mode} onChange={e=>setMode(e.target.value)}>{PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}</select></div>
          </div>
          {mode!=="Cash" && <div><label className={labelCls}>Transaction ID (Optional)</label><input className={inputCls} value={txn} onChange={e=>setTxn(e.target.value)} placeholder="e.g. BKX12345678"/></div>}
          <div><label className={labelCls}>Fee Month(s) — Multi-select</label><div className="flex flex-wrap gap-1.5">{MONTHS.map(m=><button type="button" key={m} onClick={()=>toggleMonth(m)} className={`px-2.5 py-1.5 rounded-full text-xs font-bold border ${selectedMonths.includes(m)?"bg-[#1E3A8A] text-white border-[#1E3A8A]":"bg-white"}`}>{m}</button>)}</div>
          <input className={inputCls+" mt-2"} placeholder="Or type month manually, e.g. January–February 2026" value={manualMonth} onChange={e=>setManualMonth(e.target.value)}/></div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><label className={labelCls+" !mb-0"}>Fee Categories (Multiple in One Receipt)</label><button onClick={()=>setItems([...items,{category:"Custom Fee",amount:""}])} className="text-[#D97706] font-bold text-xs flex gap-1 items-center"><Plus size={14}/> Add Item</button></div>
            {items.map((it,i)=><div key={i} className="flex gap-2"><select className={inputCls} value={it.category} onChange={e=>{ const n=[...items]; n[i].category=e.target.value; setItems(n); }}>{FEE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select><input type="number" className={inputCls} placeholder="Amount BDT" value={it.amount} onChange={e=>{ const n=[...items]; n[i].amount=e.target.value; setItems(n); }}/>{items.length>1&&<button onClick={()=>setItems(items.filter((_,x)=>x!==i))} className="text-red-500 px-2"><Trash2 size={17}/></button>}</div>)}
          </div>
          {hasExam && <div className="bg-amber-50 border-2 border-[#D97706] rounded-2xl p-3"><label className={labelCls}>Exam Name * (Required for Exam Fee)</label><input className={inputCls} value={examName} onChange={e=>setExamName(e.target.value)} placeholder='e.g. "1st Terminal Exam 2026", "Annual Exam", "Model Test"'/><p className="text-[11px] text-amber-700 font-semibold mt-1">This name will print next to Exam Fee on receipt & on the Admit Card. Admit Card button will appear automatically.</p></div>}
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Discount (BDT)</label><input type="number" className={inputCls} value={discount} onChange={e=>setDiscount(e.target.value)}/></div>
            <div><label className={labelCls}>Remaining Due (BDT)</label><input type="number" className={inputCls} value={remainingDue} onChange={e=>setRemainingDue(e.target.value)}/></div>
            <div className="bg-blue-50 rounded-xl px-3 py-2"><div className="text-[11px] font-bold text-slate-500">TOTAL PAYABLE</div><div className="font-extrabold text-[#1E3A8A] text-lg">৳{fmt(total)}</div><div className="text-[11px] text-slate-500">Gross ৳{fmt(gross)}</div></div>
          </div>
          <button onClick={submit} disabled={saving} className={btnGold+" w-full !py-3.5 !text-base"}><Wallet size={18}/>{saving?"Saving…":"Save Payment & Generate Receipt"}</button>
          {lastPayment && <div className="flex gap-2"><button onClick={()=>setPrint({type:"receipt",payment:lastPayment})} className={btnNavy+" flex-1"}><Printer size={16}/> Print Money Receipt</button>{(lastPayment.examName||lastPayment.items.some(i=>i.category==="Exam Fee"))&&<button onClick={()=>setPrint({type:"admit",payment:lastPayment})} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2.5 text-sm flex items-center justify-center gap-2"><GraduationCap size={16}/> Print Admit Card</button>}</div>}
        </div>
      </div>
      <div className="bg-white rounded-3xl border p-5"><h3 className="font-extrabold text-[#1E3A8A] flex gap-2"><FileText/> Receipt Includes</h3><ul className="text-xs text-slate-600 space-y-2 mt-3 leading-relaxed"><li>✓ Single A4 page — <b>STUDENT COPY + OFFICE COPY</b> with dotted cutting line</li><li>✓ Dynamic wing logo, name & Mohammadpur address</li><li>✓ Receipt No, Date, Year, Student ID, Class, Shift/Version, Contact, Payment Mode</li><li>✓ Itemized table: SL • Category (with Exam Name) • Month • Amount</li><li>✓ Total in numbers & words + Remaining Due</li><li>✓ Exam Fee → <b>Admit Card (A5)</b> auto-enabled</li></ul></div>
    </div>
  );
}

/* ================= PAYMENTS ================= */
function PaymentsView({ payments, setPrint }:{ payments:Payment[]; setPrint:(p:PrintState)=>void }){
  const [q,setQ]=useState(""); const [mode,setMode]=useState("all");
  const filtered=payments.filter(p=>{ const query=q.toLowerCase(); return (!query||p.receiptNo.toLowerCase().includes(query)||p.student?.fullName.toLowerCase().includes(query)||p.student?.studentCode.toLowerCase().includes(query)) && (mode==="all"||p.paymentMode===mode); });
  return <div className="space-y-4"><div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3"><div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input className={inputCls+" pl-9"} placeholder="Search receipt no, student, ID…" value={q} onChange={e=>setQ(e.target.value)}/></div><select className="rounded-xl border px-3 py-2.5 text-sm font-semibold" value={mode} onChange={e=>setMode(e.target.value)}><option value="all">All Modes</option>{PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}</select><button onClick={()=>downloadCSV("payments.csv",[["Receipt","Date","Student","ID","Class","Months","Mode","Txn","Discount","Total","Due","Exam"],...filtered.map(p=>[p.receiptNo,p.postingDate,p.student?.fullName||"",p.student?.studentCode||"",p.student?.className||"",p.feeMonths,p.paymentMode,p.transactionId,String(p.discount),String(p.totalAmount),String(p.remainingDue),p.examName])])} className={btnNavy}><Download size={16}/> Export CSV</button><span className="ml-auto font-extrabold text-[#1E3A8A]">Total: ৳{fmt(filtered.reduce((a,p)=>a+p.totalAmount,0))} ({filtered.length})</span></div>
  <div className="bg-white rounded-3xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[850px]"><thead><tr className="bg-[#1E3A8A] text-white text-left"><th className="px-4 py-3">Receipt</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id} className="border-t hover:bg-blue-50/50"><td className="px-4 py-3"><b>{p.receiptNo}</b><div className="text-xs text-slate-500">{p.postingDate} • {p.feeMonths}</div></td><td className="px-4 py-3">{p.student?.fullName}<div className="text-xs text-slate-500">{p.student?.studentCode} • {p.student?.className}</div></td><td className="px-4 py-3 text-xs">{p.items.map(i=>`${i.category}${i.category==="Exam Fee"&&p.examName?` (${p.examName})`:""}: ৳${fmt(i.amount)}`).join(", ")}</td><td className="px-4 py-3">{p.paymentMode}{p.transactionId&&<div className="text-xs text-slate-400">{p.transactionId}</div>}</td><td className="px-4 py-3 font-extrabold text-[#1E3A8A]">৳{fmt(p.totalAmount)}{p.remainingDue>0&&<div className="text-[11px] text-red-600 font-bold">Due ৳{fmt(p.remainingDue)}</div>}</td><td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={()=>setPrint({type:"receipt",payment:p})} className="bg-[#1E3A8A] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex gap-1"><Printer size={13}/> Receipt</button>{(p.examName||p.items.some(i=>i.category==="Exam Fee"))&&<button onClick={()=>setPrint({type:"admit",payment:p})} className="bg-[#D97706] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Admit Card</button>}</div></td></tr>)}{filtered.length===0&&<tr><td colSpan={6} className="text-center py-10 text-slate-400">No payments found</td></tr>}</tbody></table></div></div></div>;
}

/* ================= PROMOTE ================= */
function PromoteView({ students, year, reload, showToast }:{ students:Student[]; year:string; reload:()=>void; showToast:(m:string)=>void }){
  const [wing,setWing]=useState("school"); const [fromClass,setFromClass]=useState("Class 4"); const [targetYear,setTargetYear]=useState(String(Number(year)+1)); const [selected,setSelected]=useState<number[]>([]); const [busy,setBusy]=useState(false);
  const list = students.filter(s=>s.status==="Active"&&s.wing===wing&&s.className===fromClass);
  const target = nextClass(fromClass, wing);
  async function promote(){
    if(!target) return alert("This is the highest class — no upper class available");
    if(selected.length===0) return alert("Select at least one student");
    if(!confirm(`Promote ${selected.length} student(s) from ${fromClass} → ${target} for Academic Year ${targetYear}? Past payment history will be preserved.`)) return;
    setBusy(true);
    for(const id of selected){ const stu=students.find(s=>s.id===id); const junior=isJunior(target); await fetch(`/api/students/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({className:target, academicYear:targetYear, shift: junior? (stu?.shift||"Morning Shift"):"", version: junior? "": (stu?.version||"Bangla Version")})}); }
    setBusy(false); setSelected([]); reload(); showToast(`Promoted ${selected.length} student(s) to ${target} (${targetYear})`);
  }
  return <div className="space-y-4"><div className="bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white rounded-3xl p-5"><h3 className="font-extrabold text-lg flex gap-2"><ArrowUpCircle/> Student Upper Class Promotion</h3><p className="text-blue-100 text-sm">Single or bulk-select active students and promote to next class for the new Academic Year. Payment history stays linked to the student.</p></div>
  <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-end">
    <div><label className={labelCls}>Wing</label><select className={inputCls} value={wing} onChange={e=>{setWing(e.target.value); setFromClass(classesForWing(e.target.value)[0]); setSelected([]);}}><option value="school">{SCHOOL_NAME}</option><option value="coaching">{COACHING_NAME}</option></select></div>
    <div><label className={labelCls}>Current Class</label><select className={inputCls} value={fromClass} onChange={e=>{setFromClass(e.target.value); setSelected([]);}}>{classesForWing(wing).map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm font-bold text-amber-800">→ Promote to: {target||"— (Highest Class)"}</div>
    <div><label className={labelCls}>New Academic Year</label><select className={inputCls} value={targetYear} onChange={e=>setTargetYear(e.target.value)}>{YEARS.map(y=><option key={y}>{y}</option>)}<option>{String(Number(year)+2)}</option></select></div>
    <button onClick={()=>setSelected(list.map(s=>s.id))} className="bg-slate-100 font-bold rounded-xl px-4 py-2.5 text-sm">Select All ({list.length})</button>
    <button onClick={()=>setSelected([])} className="bg-slate-100 font-bold rounded-xl px-4 py-2.5 text-sm">Clear</button>
    <button disabled={busy||!target} onClick={promote} className={btnGold+" ml-auto"}><ArrowUpCircle size={17}/>{busy?"Promoting…":`Promote Selected (${selected.length})`}</button>
  </div>
  <div className="bg-white rounded-3xl border overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-[#1E3A8A] text-white text-left"><th className="px-4 py-3 w-10"><input type="checkbox" checked={list.length>0&&selected.length===list.length} onChange={e=>setSelected(e.target.checked?list.map(s=>s.id):[])}/></th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Current</th><th className="px-4 py-3">Promote To</th><th className="px-4 py-3">Contact</th></tr></thead><tbody>{list.map(s=><tr key={s.id} className="border-t"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(s.id)} onChange={e=>setSelected(e.target.checked?[...selected,s.id]:selected.filter(x=>x!==s.id))}/></td><td className="px-4 py-3"><b>{s.fullName}</b><div className="text-xs text-slate-500">{s.studentCode}</div></td><td className="px-4 py-3">{s.className} • {s.shift||s.version}</td><td className="px-4 py-3 font-bold text-[#D97706]">{target} • {targetYear}</td><td className="px-4 py-3">{s.primaryContact}</td></tr>)}{list.length===0&&<tr><td colSpan={5} className="text-center py-8 text-slate-400">No active students in {fromClass} ({wingName(wing)}) for {year}</td></tr>}</tbody></table></div></div>;
}

/* ================= EXPENSES ================= */
function ExpensesView({ expenses, year, settings, reload, setPrint, showToast }:{ expenses:Expense[]; year:string; settings:Record<string,string>; reload:()=>void; setPrint:(p:PrintState)=>void; showToast:(m:string)=>void }){
  const [f,setF]=useState({expenseDate:todayISO(), wing:"General", paidTo:"", category:"House Rent", description:"", amount:"", paymentMode:"Cash"}); const [last,setLast]=useState<Expense|null>(null);
  async function submit(e:React.FormEvent){ e.preventDefault(); const r=await fetch("/api/expenses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...f, amount:Number(f.amount||0), academicYear:year})}); const d=await r.json(); if(!r.ok) return alert(d.error||"Failed"); setLast(d); reload(); showToast(`Expense saved! Voucher ${d.voucherNo}`); setPrint({type:"voucher", expense:d}); setF({...f,paidTo:"",description:"",amount:""}); }
  async function del(id:number){ if(!confirm("Delete this expense?")) return; await fetch(`/api/expenses?id=${id}`,{method:"DELETE"}); reload(); }
  return <div className="grid lg:grid-cols-3 gap-5 items-start"><form onSubmit={submit} className="bg-white rounded-3xl border p-5 space-y-3"><h3 className="font-extrabold text-[#1E3A8A]">Log Daily Expense</h3>
    <div><label className={labelCls}>Date *</label><input type="date" className={inputCls} value={f.expenseDate} onChange={e=>setF({...f,expenseDate:e.target.value})} required/></div>
    <div><label className={labelCls}>Wing *</label><select className={inputCls} value={f.wing} onChange={e=>setF({...f,wing:e.target.value})}><option>School</option><option>Academic Care</option><option>General</option></select></div>
    <div><label className={labelCls}>Paid To / Receiver *</label><input className={inputCls} required value={f.paidTo} onChange={e=>setF({...f,paidTo:e.target.value})} placeholder="e.g. Md. Teacher Name / Landlord"/></div>
    <div><label className={labelCls}>Expense Category *</label><select className={inputCls} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
    <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></div>
    <div className="grid grid-cols-2 gap-2"><div><label className={labelCls}>Amount (BDT) *</label><input type="number" className={inputCls} required value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div><div><label className={labelCls}>Payment Mode</label><select className={inputCls} value={f.paymentMode} onChange={e=>setF({...f,paymentMode:e.target.value})}><option>Cash</option><option>bKash</option><option>Bank</option></select></div></div>
    <button className={btnNavy+" w-full"}><Plus size={16}/> Save Expense & Print Voucher</button>
    {last && <button type="button" onClick={()=>setPrint({type:"voucher",expense:last})} className={btnGold+" w-full"}><Printer size={16}/> Print Last Voucher ({last.voucherNo})</button>}
  </form>
  <div className="lg:col-span-2 bg-white rounded-3xl border overflow-hidden"><div className="p-4 flex justify-between"><h3 className="font-extrabold text-[#1E3A8A]">Expenses — Session {year}</h3><b className="text-[#D97706]">Total ৳{fmt(expenses.reduce((a,e)=>a+e.amount,0))}</b></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[700px]"><thead><tr className="bg-[#1E3A8A] text-white text-left"><th className="px-4 py-3">Voucher</th><th className="px-4 py-3">Paid To</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{expenses.map(e=><tr key={e.id} className="border-t"><td className="px-4 py-3"><b>{e.voucherNo}</b><div className="text-xs text-slate-500">{e.expenseDate} • {e.wing} • {e.paymentMode}</div></td><td className="px-4 py-3">{e.paidTo}<div className="text-xs text-slate-500">{e.description}</div></td><td className="px-4 py-3">{e.category}</td><td className="px-4 py-3 font-bold">৳{fmt(e.amount)}</td><td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={()=>setPrint({type:"voucher",expense:e})} className="bg-[#1E3A8A] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex gap-1"><Printer size={13}/> Voucher</button><button onClick={()=>del(e.id)} className="text-red-500 px-2"><Trash2 size={16}/></button></div></td></tr>)}{expenses.length===0&&<tr><td colSpan={5} className="text-center py-8 text-slate-400">No expenses in {year}</td></tr>}</tbody></table></div></div></div>;
}

/* ================= WHATSAPP ================= */
function WhatsAppView({ students, payments }:{ students:Student[]; payments:Payment[] }){
  const curMonthName = MONTHS[new Date().getMonth()];
  const [wing,setWing]=useState("all"); const [cls,setCls]=useState("all"); const [sv,setSv]=useState("all"); const [payStatus,setPayStatus]=useState("all"); const [month,setMonth]=useState(curMonthName);
  const [msg,setMsg]=useState("Assalamu Alaikum, Dear Guardian of {StudentName} ({Class}), this is a reminder from Medhakunja that the tuition fee for {Month} is due. Due Amount: ৳{DueAmount}. Please pay soon. Thank you. — Medhakunja");
  const [copied,setCopied]=useState(false);
  function dueFor(s:Student){ const pays=payments.filter(p=>p.student?.id===s.id); const paidThisMonth=pays.some(p=>(p.feeMonths||"").includes(month)); const lastDue=pays.length? pays[0].remainingDue||0:0; return { paid:paidThisMonth, due: paidThisMonth? lastDue : (s.monthlyFee||0)+lastDue }; }
  const filtered=students.filter(s=>{ if(s.status!=="Active") return false; const d=dueFor(s); return (wing==="all"||s.wing===wing)&&(cls==="all"||s.className===cls)&&(sv==="all"||s.shift===sv||s.version===sv)&&(payStatus==="all"||(payStatus==="Unpaid/Due"? !d.paid||d.due>0 : d.paid&&d.due===0)); });
  function personal(s:Student){ const d=dueFor(s); return msg.replaceAll("{StudentName}",s.fullName).replaceAll("{Class}",s.className).replaceAll("{DueAmount}",String(d.due)).replaceAll("{Month}",month); }
  function copyAll(){ const nums=filtered.map(s=>s.whatsapp||s.primaryContact).join(", "); navigator.clipboard.writeText(nums); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return <div className="space-y-4"><div className="bg-emerald-600 text-white rounded-3xl p-5"><h3 className="font-extrabold text-lg flex gap-2"><MessageCircle/> WhatsApp Notices — 100% Free (wa.me)</h3><p className="text-emerald-100 text-sm">Filter students, personalize with {"{StudentName} {Class} {DueAmount} {Month}"} tags, then tap Send — opens WhatsApp with pre-filled message. No paid API needed.</p></div>
  <div className="bg-white rounded-2xl border p-4 grid md:grid-cols-5 gap-3">
    <div><label className={labelCls}>Wing</label><select className={inputCls} value={wing} onChange={e=>setWing(e.target.value)}><option value="all">Both Wings</option><option value="school">School</option><option value="coaching">Academic Care</option></select></div>
    <div><label className={labelCls}>Class</label><select className={inputCls} value={cls} onChange={e=>setCls(e.target.value)}><option value="all">All Classes</option>{[...SCHOOL_CLASSES,...COACHING_CLASSES.filter(c=>!SCHOOL_CLASSES.includes(c))].map(c=><option key={c}>{c}</option>)}</select></div>
    <div><label className={labelCls}>Shift / Version</label><select className={inputCls} value={sv} onChange={e=>setSv(e.target.value)}><option value="all">All</option>{[...SHIFTS,...VERSIONS].map(v=><option key={v}>{v}</option>)}</select></div>
    <div><label className={labelCls}>Fee Month</label><select className={inputCls} value={month} onChange={e=>setMonth(e.target.value)}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select></div>
    <div><label className={labelCls}>Payment Status</label><select className={inputCls} value={payStatus} onChange={e=>setPayStatus(e.target.value)}><option value="all">All</option><option>Unpaid/Due</option><option>Paid</option></select></div>
    <div className="md:col-span-5"><label className={labelCls}>Custom Message (Tags: {"{StudentName} {Class} {DueAmount} {Month}"})</label><textarea className={inputCls} rows={3} value={msg} onChange={e=>setMsg(e.target.value)}/></div>
    <div className="md:col-span-5 flex flex-wrap gap-2"><button onClick={copyAll} className={btnNavy}><Copy size={16}/>{copied?"Copied!":"Copy All Numbers"} ({filtered.length})</button><button onClick={()=>downloadCSV("whatsapp-contacts.csv",[["Name","Student ID","Class","Wing","WhatsApp","Due"],...filtered.map(s=>[s.fullName,s.studentCode,s.className,wingName(s.wing),s.whatsapp||s.primaryContact,String(dueFor(s).due)])])} className={btnGold}><Download size={16}/> Export Contact List (CSV)</button></div>
  </div>
  <div className="bg-white rounded-3xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[750px]"><thead><tr className="bg-[#1E3A8A] text-white text-left"><th className="px-4 py-3">Student</th><th className="px-4 py-3">WhatsApp</th><th className="px-4 py-3">Status ({month})</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{filtered.map(s=>{ const d=dueFor(s); return <tr key={s.id} className="border-t"><td className="px-4 py-3"><b>{s.fullName}</b><div className="text-xs text-slate-500">{s.studentCode} • {s.className} • {s.shift||s.version} • {s.wing==="coaching"?"Academic Care":"School"}</div></td><td className="px-4 py-3">{s.whatsapp||s.primaryContact}</td><td className="px-4 py-3">{d.paid?<span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">Paid</span>:<span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Unpaid • Due ৳{fmt(d.due)}</span>}</td><td className="px-4 py-3"><a target="_blank" href={`https://wa.me/${waNumber(s.whatsapp||s.primaryContact)}?text=${encodeURIComponent(personal(s))}`} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg inline-flex gap-1 items-center"><MessageCircle size={14}/> Send WhatsApp</a></td></tr>;})}{filtered.length===0&&<tr><td colSpan={4} className="text-center py-8 text-slate-400">No students match filters</td></tr>}</tbody></table></div></div></div>;
}

/* ================= REPORTS ================= */
function ReportsView({ students, payments, expenses, year, setPrint }:{ students:Student[]; payments:Payment[]; expenses:Expense[]; year:string; setPrint:(p:PrintState)=>void }){
  const [date,setDate]=useState(todayISO()); const [month,setMonth]=useState(MONTHS[new Date().getMonth()]);
  const daily = payments.filter(p=>p.postingDate===date); const dailyExp = expenses.filter(e=>e.expenseDate===date);
  const byMode=(m:string)=>daily.filter(p=>p.paymentMode===m).reduce((a,p)=>a+p.totalAmount,0);
  const dueList = students.filter(s=>s.status==="Active" && !payments.some(p=>p.student?.id===s.id && (p.feeMonths||"").includes(month)));
  async function backup(){ const r=await fetch("/api/backup"); const d=await r.json(); downloadJSON(`medhakunja-backup-${year}-${todayISO()}.json`, d); }
  return <div className="space-y-5">
    <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-end"><div><label className={labelCls}>Daily Ledger Date</label><input type="date" className={inputCls} value={date} onChange={e=>setDate(e.target.value)}/></div><div><label className={labelCls}>Due Month</label><select className={inputCls} value={month} onChange={e=>setMonth(e.target.value)}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select></div>
    <button onClick={backup} className={btnGold}><Download size={16}/> Backup / Export All Data (JSON)</button><button onClick={()=>window.print()} className={btnNavy}><Printer size={16}/> Print Reports</button></div>
    <div id="print-root-off" className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-3xl border p-5"><h3 className="font-extrabold text-[#1E3A8A]">Daily Collection Ledger — {date}</h3><div className="grid grid-cols-4 gap-2 mt-3 text-center">{["Cash","bKash","Nagad","Bank Transfer"].map(m=><div key={m} className="bg-blue-50 rounded-xl p-3"><div className="text-[11px] font-bold text-slate-500">{m}</div><div className="font-extrabold text-[#1E3A8A]">৳{fmt(byMode(m))}</div></div>)}</div>
      <table className="w-full text-sm mt-3"><tbody>{daily.map(p=><tr key={p.id} className="border-t"><td className="py-2">{p.receiptNo} • {p.student?.fullName}</td><td className="py-2 text-right">{p.paymentMode}</td><td className="py-2 text-right font-bold">৳{fmt(p.totalAmount)}</td></tr>)}</tbody></table><div className="font-extrabold text-right mt-2">Day Total: ৳{fmt(daily.reduce((a,p)=>a+p.totalAmount,0))}</div>
      <button onClick={()=>downloadCSV(`daily-collection-${date}.csv`,[["Receipt","Student","ID","Mode","Amount"],...daily.map(p=>[p.receiptNo,p.student?.fullName||"",p.student?.studentCode||"",p.paymentMode,String(p.totalAmount)])])} className="mt-3 bg-slate-100 font-bold rounded-xl px-3 py-2 text-xs flex gap-1 items-center"><Download size={14}/> Export CSV</button></div>
      <div className="bg-white rounded-3xl border p-5"><h3 className="font-extrabold text-[#1E3A8A]">Daily Expense Sheet — {date}</h3><table className="w-full text-sm mt-3"><tbody>{dailyExp.map(e=><tr key={e.id} className="border-t"><td className="py-2">{e.voucherNo} • {e.paidTo} ({e.category})</td><td className="py-2 text-right font-bold">৳{fmt(e.amount)}</td><td className="py-2 text-right"><button onClick={()=>setPrint({type:"voucher",expense:e})} className="text-[#1E3A8A] font-bold text-xs">Voucher</button></td></tr>)}</tbody></table><div className="font-extrabold text-right mt-2">Day Total: ৳{fmt(dailyExp.reduce((a,e)=>a+e.amount,0))}</div>
      <button onClick={()=>downloadCSV(`daily-expenses-${date}.csv`,[["Voucher","Paid To","Category","Mode","Amount"],...dailyExp.map(e=>[e.voucherNo,e.paidTo,e.category,e.paymentMode,String(e.amount)])])} className="mt-3 bg-slate-100 font-bold rounded-xl px-3 py-2 text-xs flex gap-1 items-center"><Download size={14}/> Export CSV</button></div>
    </div>
    <div className="bg-white rounded-3xl border p-5"><div className="flex justify-between flex-wrap gap-2"><h3 className="font-extrabold text-[#1E3A8A]">Student-wise Due List — {month} {year} ({dueList.length} unpaid)</h3><button onClick={()=>downloadCSV(`due-list-${month}-${year}.csv`,[["Student ID","Name","Wing","Class","Shift/Version","Contact","WhatsApp","Monthly Fee"],...dueList.map(s=>[s.studentCode,s.fullName,wingName(s.wing),s.className,s.shift||s.version,s.primaryContact,s.whatsapp,String(s.monthlyFee)])])} className={btnNavy}><Download size={15}/> Export Due List CSV</button></div>
    <div className="overflow-x-auto mt-3"><table className="w-full text-sm min-w-[700px]"><thead><tr className="bg-red-50 text-left"><th className="px-3 py-2">Student</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Contact / WhatsApp</th><th className="px-3 py-2">Due (Monthly Fee)</th><th className="px-3 py-2">WhatsApp</th></tr></thead><tbody>{dueList.map(s=><tr key={s.id} className="border-t"><td className="px-3 py-2"><b>{s.fullName}</b><div className="text-xs text-slate-500">{s.studentCode} • {s.wing==="coaching"?"Academic Care":"School"}</div></td><td className="px-3 py-2">{s.className} • {s.shift||s.version}</td><td className="px-3 py-2">{s.primaryContact}<div className="text-xs text-slate-500">{s.whatsapp}</div></td><td className="px-3 py-2 font-bold text-red-600">৳{fmt(s.monthlyFee||0)}</td><td className="px-3 py-2"><a target="_blank" className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg" href={`https://wa.me/${waNumber(s.whatsapp||s.primaryContact)}?text=${encodeURIComponent(`Assalamu Alaikum, Dear Guardian of ${s.fullName} (${s.className}), tuition fee for ${month} (৳${s.monthlyFee}) is due. Please pay soon. — Medhakunja`)}`}>Remind</a></td></tr>)}{dueList.length===0&&<tr><td colSpan={5} className="text-center py-6 text-emerald-600 font-bold">All active students have paid for {month}! 🎉</td></tr>}</tbody></table></div></div>
  </div>;
}

/* ================= SETTINGS ================= */
function SettingsView({ settings, setSettings, showToast, onSeed }:{ settings:Record<string,string>; setSettings:(s:Record<string,string>)=>void; showToast:(m:string)=>void; onSeed:()=>void }){
  const [local,setLocal]=useState<Record<string,string>>(settings); useEffect(()=>setLocal(settings),[settings]);
  async function save(){ const r=await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(local)}); const d=await r.json(); setSettings(d); showToast("Institution settings saved to database"); }
  function UploadField({ k, label, fallback }:{ k:string; label:string; fallback:string }){
    return <div className="border rounded-2xl p-4"><label className={labelCls}>{label}</label><div className="flex items-center gap-3"><img src={local[k]||fallback} className="w-20 h-20 object-contain border rounded-xl bg-white" alt={label}/><div><input type="file" accept="image/*" className="text-xs" onChange={e=>{ const f=e.target.files?.[0]; if(f) fileToDataUrl(f,(s)=>setLocal({...local,[k]:s})); }}/><p className="text-[11px] text-slate-400 mt-1">PNG/JPG • Saved persistently in database • Used on receipts, admit cards & vouchers</p>{local[k]&&<button onClick={()=>setLocal({...local,[k]:""})} className="text-red-500 text-xs font-bold mt-1">Remove / Use Default</button>}</div></div></div>;
  }
  return <div className="space-y-5"><div className="bg-white rounded-3xl border p-6"><h3 className="font-extrabold text-[#1E3A8A] text-lg">Institution Settings — Logos, Signature & Seal</h3><p className="text-sm text-slate-500">Upload once — applied dynamically everywhere (Login, Receipts, Admit Cards, Expense Vouchers) based on wing.</p>
  <div className="grid md:grid-cols-2 gap-4 mt-4">
    <UploadField k="schoolLogo" label="1. Medhakunja Model School Logo" fallback="/images/school-logo.png"/>
    <UploadField k="coachingLogo" label="2. Medhakunja Academic Care Logo" fallback="/images/coaching-logo.png"/>
    <UploadField k="signature" label="3. Principal / Director Digital Signature" fallback="/images/school-logo.png"/>
    <UploadField k="seal" label="4. Official Office Seal" fallback="/images/coaching-logo.png"/>
  </div><button onClick={save} className={btnGold+" mt-4"}><Check size={17}/> Save All Settings to Database</button></div>
  <div className="grid md:grid-cols-2 gap-4">
    <div className="bg-[#1E3A8A] text-white rounded-3xl p-5"><h4 className="font-extrabold flex gap-2"><GraduationCap/> Wing Configuration</h4><div className="text-sm mt-3 space-y-3"><div className="bg-white/10 rounded-xl p-3"><b>{SCHOOL_NAME}</b><div className="text-blue-200 text-xs flex gap-1 mt-1"><MapPin size={12}/>{SCHOOL_ADDRESS}</div><div className="text-xs mt-1">Classes: {SCHOOL_CLASSES.join(", ")}</div></div><div className="bg-white/10 rounded-xl p-3"><b>{COACHING_NAME}</b><div className="text-blue-200 text-xs mt-1">Branch 1: {COACHING_BRANCHES[0]}<br/>Branch 2: {COACHING_BRANCHES[1]}</div><div className="text-xs mt-1">Classes: {COACHING_CLASSES.join(", ")}</div></div></div></div>
    <div className="bg-white rounded-3xl border p-5"><h4 className="font-extrabold text-[#1E3A8A]">Data & Hosting</h4><ul className="text-sm text-slate-600 space-y-2 mt-3"><li>• Database: PostgreSQL via Drizzle ORM (works with Supabase / Neon free tier)</li><li>• Hosting-ready: Vercel / Netlify — set <code className="bg-slate-100 px-1 rounded">DATABASE_URL</code>, <code className="bg-slate-100 px-1 rounded">ADMIN_EMAIL</code>, <code className="bg-slate-100 px-1 rounded">ADMIN_PASSWORD</code></li><li>• Public sign-up disabled • Secure cookie admin session</li></ul><div className="flex flex-wrap gap-2 mt-4"><button onClick={onSeed} className={btnNavy}>Load Sample Data</button><button onClick={async()=>{ const r=await fetch("/api/backup"); downloadJSON("medhakunja-backup.json", await r.json()); }} className={btnGold}><Download size={16}/> Backup All Data</button></div><div className="mt-4 bg-slate-50 rounded-xl p-3 text-xs"><b>Admin Login:</b> admin@medhakunja.edu.bd / Medha@2026 <span className="text-slate-400">(default — override with env vars in production)</span></div></div>
  </div></div>;
}
