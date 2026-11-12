export const NAVY = "#1E3A8A";
export const GOLD = "#D97706";

export const SCHOOL_NAME = "Medhakunja Model School";
export const COACHING_NAME = "Medhakunja Academic Care";
export const SCHOOL_ADDRESS = "9/17, Block-C, Tajmahal Road, Mohammadpur, Dhaka-1207.";
export const COACHING_BRANCHES = [
  "9/17, Block-C, Tajmahal Road, Mohammadpur, Dhaka-1207",
  "15/15, Block-C, Tajmahal Road, Mohammadpur, Dhaka-1207",
];
export const COACHING_ADDRESS_TEXT = "1) 9/17, Block-C, Tajmahal Road, Mohammadpur, Dhaka-1207 & 2) 15/15, Block-C, Tajmahal Road, Mohammadpur, Dhaka-1207.";

export const SCHOOL_CLASSES = ["Play Group","Nursery","KG","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10"];
export const COACHING_CLASSES = ["Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Intermediate 1st Year","Intermediate 2nd Year"];
export const JUNIOR_CLASSES = ["Play Group","Nursery","KG"];
export const SHIFTS = ["Morning Shift","Day Shift"];
export const VERSIONS = ["Bangla Version","English Version"];
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const FEE_CATEGORIES = ["Tuition Fee","Admission Fee","Form Fee","Package Fee","Exam Fee","Due Payment","Custom Fee"];
export const PAYMENT_MODES = ["Cash","bKash","Nagad","Bank Transfer"];
export const EXPENSE_CATEGORIES = ["House Rent","Teacher Salary","Utility Bills","Stationary","Snacks/Entertainment","Maintenance","Other"];
export const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
export const YEARS = ["2025","2026","2027","2028"];

export function isJunior(cls: string) { return JUNIOR_CLASSES.includes(cls); }
export function classesForWing(wing: string) { return wing === "coaching" ? COACHING_CLASSES : SCHOOL_CLASSES; }
export function nextClass(cls: string, wing: string): string | null {
  const list = classesForWing(wing);
  const i = list.indexOf(cls);
  if (i < 0 || i >= list.length - 1) return null;
  return list[i+1];
}
export function wingName(wing: string) { return wing === "coaching" ? COACHING_NAME : SCHOOL_NAME; }
export function wingAddress(wing: string) { return wing === "coaching" ? COACHING_ADDRESS_TEXT : SCHOOL_ADDRESS; }
export function fmt(n: number) { return (n||0).toLocaleString("en-IN"); }
export function todayISO() { return new Date().toISOString().slice(0,10); }
export function monthNameFromISO(iso: string) {
  if (!iso) return "";
  const m = parseInt(iso.slice(5,7),10);
  return MONTHS[m-1] || "";
}
export function waNumber(raw: string) {
  let d = (raw||"").replace(/\D/g,"");
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) d = "88"+d;
  else if (d.length===10) d = "880"+d;
  else if (!d.startsWith("880")) d = "880"+d;
  return d;
}

const ONES = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
function below1000(n:number):string{
  let s="";
  if(n>=100){ s+=ONES[Math.floor(n/100)]+" Hundred"; n%=100; if(n) s+=" "; }
  if(n>=20){ s+=TENS[Math.floor(n/10)]; n%=10; if(n) s+=" "+ONES[n]; }
  else if(n>0){ s+=ONES[n]; }
  return s;
}
export function amountInWords(num:number):string{
  if(num===0) return "Zero Taka Only";
  let n=Math.floor(Math.abs(num)); const parts:string[]=[];
  const crore=Math.floor(n/10000000); n%=10000000;
  const lakh=Math.floor(n/100000); n%=100000;
  const thousand=Math.floor(n/1000); n%=1000;
  if(crore) parts.push(below1000(crore)+" Crore");
  if(lakh) parts.push(below1000(lakh)+" Lakh");
  if(thousand) parts.push(below1000(thousand)+" Thousand");
  if(n) parts.push(below1000(n));
  return parts.join(" ")+" Taka Only";
}
export function downloadCSV(filename:string, rows:string[][]){
  const csv = rows.map(r=>r.map(c=>`"${String(c??"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}
export function downloadJSON(filename:string, data:unknown){
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}
