"use client";
import { fmt, amountInWords, wingName, wingAddress, SCHOOL_ADDRESS } from "@/lib/constants";

export type AnyStudent = { id:number; studentCode:string; fullName:string; wing:string; branch:string; className:string; shift:string; version:string; primaryContact:string; whatsapp:string; academicYear:string; monthlyFee?:number };
export type AnyPayment = { id:number; receiptNo:string; postingDate:string; academicYear:string; feeMonths:string; discount:number; totalAmount:number; grossAmount:number; remainingDue:number; paymentMode:string; transactionId:string; examName:string; items:{category:string;month:string;amount:number;examName:string}[]; student:AnyStudent|null };
export type AnyExpense = { id:number; voucherNo:string; expenseDate:string; wing:string; paidTo:string; category:string; description:string; amount:number; paymentMode:string; academicYear:string };

export function logoForWing(wing:string, settings:Record<string,string>) {
  if (wing==="coaching") return settings.coachingLogo || "/images/coaching-logo.png";
  return settings.schoolLogo || "/images/school-logo.png";
}

function ReceiptHalf({ payment, copyLabel, settings }: { payment:AnyPayment; copyLabel:string; settings:Record<string,string> }) {
  const stu = payment.student!;
  const wing = stu.wing;
  const logo = logoForWing(wing, settings);
  return (
    <div className="receipt-half border border-slate-800 p-[6px] relative bg-white" style={{fontSize:"10.5px", lineHeight:1.35}}>
      <div className="absolute top-1 right-2 border border-[#1E3A8A] text-[#1E3A8A] font-bold px-2 py-[1px] rounded text-[9px] tracking-widest">{copyLabel}</div>
      <div className="flex items-center gap-2 border-b-2 border-[#1E3A8A] pb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="logo" className="w-11 h-11 object-contain rounded-full border" />
        <div className="flex-1 text-center pr-10">
          <div className="font-extrabold text-[#1E3A8A]" style={{fontSize:"16px", lineHeight:1.1}}>{wingName(wing)}</div>
          <div className="text-slate-600" style={{fontSize:"9px"}}>{wing==="coaching" ? "Branch: "+wingAddress(wing) : wingAddress(wing)}</div>
          <div className="inline-block bg-[#1E3A8A] text-white px-3 py-[1px] rounded-full font-bold tracking-widest mt-[2px]" style={{fontSize:"9px"}}>MONEY RECEIPT</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-3 mt-1">
        <div><b>Receipt No:</b> {payment.receiptNo}</div>
        <div><b>Date:</b> {payment.postingDate}</div>
        <div><b>Academic Year:</b> {payment.academicYear}</div>
        <div><b>Student ID:</b> {stu.studentCode}</div>
        <div className="col-span-2"><b>Student Name:</b> {stu.fullName}</div>
        <div><b>Class/Batch:</b> {stu.className}</div>
        <div><b>{stu.shift ? "Shift" : "Version"}:</b> {stu.shift || stu.version || "—"}</div>
        <div><b>Contact:</b> {stu.primaryContact}</div>
        <div><b>Payment Mode:</b> {payment.paymentMode}{payment.transactionId ? ` (${payment.transactionId})` : ""}</div>
        <div className="col-span-2"><b>Fee Month(s):</b> {payment.feeMonths || "—"}</div>
      </div>
      <table className="w-full border-collapse mt-1" style={{fontSize:"10px"}}>
        <thead><tr className="bg-[#1E3A8A] text-white"><th className="border border-slate-400 px-1 py-[2px] w-8">SL</th><th className="border border-slate-400 px-1 py-[2px] text-left">Fee Category</th><th className="border border-slate-400 px-1 py-[2px]">Month</th><th className="border border-slate-400 px-1 py-[2px] text-right w-24">Amount (BDT)</th></tr></thead>
        <tbody>
          {payment.items.map((it,i)=>(
            <tr key={i}><td className="border border-slate-300 px-1 py-[2px] text-center">{i+1}</td><td className="border border-slate-300 px-1 py-[2px]">{it.category}{it.category==="Exam Fee" && (it.examName||payment.examName) ? ` — ${it.examName||payment.examName}` : ""}</td><td className="border border-slate-300 px-1 py-[2px] text-center">{it.month||payment.feeMonths||"—"}</td><td className="border border-slate-300 px-1 py-[2px] text-right">{fmt(it.amount)}</td></tr>
          ))}
          {payment.discount>0 && <tr><td className="border border-slate-300 px-1 py-[2px] text-center">—</td><td className="border border-slate-300 px-1 py-[2px]">Discount</td><td className="border border-slate-300 px-1 py-[2px] text-center">—</td><td className="border border-slate-300 px-1 py-[2px] text-right">-{fmt(payment.discount)}</td></tr>}
        </tbody>
      </table>
      <div className="flex justify-between mt-1 gap-3">
        <div className="flex-1"><b>In Words:</b> {amountInWords(payment.totalAmount)} {payment.remainingDue>0 && <span> &nbsp;|&nbsp; <b className="text-red-700">Remaining Due: ৳{fmt(payment.remainingDue)}</b></span>}</div>
        <div className="border border-slate-800 px-2 py-[2px] font-bold whitespace-nowrap">Total Paid: ৳{fmt(payment.totalAmount)}</div>
      </div>
      <div className="flex justify-between mt-5 px-1">
        <div className="text-center w-44"><div className="border-t border-slate-800 pt-[2px]">Received By (Authorized Signature)</div></div>
        <div className="text-center w-36"><div className="border-t border-slate-800 pt-[2px]">Guardian Signature</div></div>
      </div>
    </div>
  );
}

export function MoneyReceiptPrint({ payment, settings }: { payment:AnyPayment; settings:Record<string,string> }) {
  if (!payment.student) return null;
  return (
    <div className="bg-white text-black" style={{width:"190mm", margin:"0 auto"}}>
      <ReceiptHalf payment={payment} copyLabel="STUDENT COPY" settings={settings} />
      <div className="flex items-center gap-2 my-1"><div className="flex-1 border-t border-dashed border-slate-500"/><span style={{fontSize:"9px"}}>✂ CUT HERE</span><div className="flex-1 border-t border-dashed border-slate-500"/></div>
      <ReceiptHalf payment={payment} copyLabel="OFFICE COPY" settings={settings} />
    </div>
  );
}

export function AdmitCardPrint({ payment, settings }: { payment:AnyPayment; settings:Record<string,string> }) {
  const stu = payment.student!;
  const wing = stu.wing;
  const logo = logoForWing(wing, settings);
  return (
    <div className="admit-box bg-white text-black border-2 border-[#1E3A8A] p-3 mx-auto" style={{fontSize:"11px"}}>
      <div className="flex items-center gap-3 border-b-2 border-[#D97706] pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="logo" className="w-14 h-14 object-contain" />
        <div className="flex-1 text-center">
          <div className="font-extrabold text-[#1E3A8A]" style={{fontSize:"18px"}}>{wingName(wing)}</div>
          <div className="text-slate-600" style={{fontSize:"9.5px"}}>{wingAddress(wing)}</div>
          <div className="inline-block bg-[#D97706] text-white font-extrabold tracking-[0.3em] px-4 py-[2px] rounded mt-1">ADMIT CARD</div>
        </div>
        <div className="w-20 h-24 border border-slate-400 flex items-center justify-center text-center text-slate-400" style={{fontSize:"9px"}}>Passport<br/>Photo</div>
      </div>
      <div className="text-center font-bold mt-2" style={{fontSize:"14px"}}>{payment.examName || "Examination"} &nbsp;•&nbsp; Academic Year: {payment.academicYear}</div>
      <div className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full px-3 py-[2px] font-bold mt-1">✓ Exam Fee Paid (Receipt No: #{payment.receiptNo})</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 border border-slate-300 p-2">
        <div><b>Student ID:</b> {stu.studentCode}</div><div><b>Roll / Seat No:</b> ____________</div>
        <div><b>Student Name:</b> {stu.fullName}</div><div><b>Class/Batch:</b> {stu.className}</div>
        <div><b>{stu.shift?"Shift":"Version"}:</b> {stu.shift||stu.version||"—"}</div><div><b>Contact:</b> {stu.primaryContact}</div>
      </div>
      <div className="mt-2 border border-slate-200 p-2" style={{fontSize:"9.5px"}}>
        <b>Exam Rules:</b> 1) Bring this admit card daily. 2) Arrive 15 minutes before exam. 3) No mobile/electronic devices. 4) Maintain discipline & dress code. 5) Without fee clearance, admit card is invalid.
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="text-center w-40"><div className="border-t border-slate-800 pt-1">Class Teacher</div></div>
        <div className="flex items-end gap-3">
          {settings.seal && /* eslint-disable-next-line @next/next/no-img-element */ <img src={settings.seal} alt="seal" className="w-16 h-16 object-contain opacity-90" />}
          <div className="text-center w-48">
            {settings.signature && /* eslint-disable-next-line @next/next/no-img-element */ <img src={settings.signature} alt="sign" className="h-8 mx-auto object-contain" />}
            <div className="border-t border-slate-800 pt-1">Principal / Director Signature & Seal</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpenseVoucherPrint({ expense, settings }: { expense:AnyExpense; settings:Record<string,string> }) {
  const isGeneral = expense.wing==="General";
  return (
    <div className="bg-white text-black border-2 border-slate-800 p-4 mx-auto" style={{width:"180mm", fontSize:"11px"}}>
      <div className="flex items-center justify-center gap-4 border-b-2 border-[#1E3A8A] pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={settings.schoolLogo||"/images/school-logo.png"} alt="school" className="w-12 h-12 object-contain" />
        <div className="text-center">
          <div className="font-extrabold text-[#1E3A8A]" style={{fontSize:"16px"}}>{isGeneral ? "Medhakunja Model School & Medhakunja Academic Care" : expense.wing==="School" ? "Medhakunja Model School" : "Medhakunja Academic Care"}</div>
          <div className="text-slate-600" style={{fontSize:"9px"}}>{SCHOOL_ADDRESS}</div>
          <div className="inline-block bg-[#1E3A8A] text-white px-3 py-[1px] rounded-full font-bold tracking-widest mt-1" style={{fontSize:"9px"}}>EXPENSE VOUCHER</div>
        </div>
        {!isGeneral && expense.wing==="Academic Care" ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={settings.coachingLogo||"/images/coaching-logo.png"} alt="coaching" className="w-12 h-12 object-contain" /> : isGeneral ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={settings.coachingLogo||"/images/coaching-logo.png"} alt="coaching" className="w-12 h-12 object-contain" /> : <div className="w-12"/>}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div><b>Voucher No:</b> {expense.voucherNo}</div><div><b>Date:</b> {expense.expenseDate}</div><div><b>Wing:</b> {expense.wing}</div>
        <div className="col-span-2"><b>Paid To / Receiver:</b> {expense.paidTo}</div><div><b>Payment Mode:</b> {expense.paymentMode}</div>
        <div className="col-span-3"><b>Category:</b> {expense.category}</div>
      </div>
      <table className="w-full border-collapse mt-2"><thead><tr className="bg-[#1E3A8A] text-white"><th className="border px-2 py-1 text-left">Description</th><th className="border px-2 py-1 text-right w-32">Amount (BDT)</th></tr></thead>
      <tbody><tr><td className="border px-2 py-2">{expense.description||expense.category}</td><td className="border px-2 py-2 text-right font-bold">৳{fmt(expense.amount)}</td></tr></tbody></table>
      <div className="mt-2"><b>In Words:</b> {amountInWords(expense.amount)}</div>
      <div className="flex justify-between mt-10">
        <div className="text-center w-36"><div className="border-t border-slate-800 pt-1">Prepared By</div></div>
        <div className="text-center w-40"><div className="border-t border-slate-800 pt-1">Received By (Payee)</div></div>
        <div className="text-center w-52">
          {settings.signature && /* eslint-disable-next-line @next/next/no-img-element */ <img src={settings.signature} alt="sign" className="h-7 mx-auto object-contain" />}
          <div className="border-t border-slate-800 pt-1">Approved By (Principal/Director)</div>
        </div>
      </div>
    </div>
  );
}
