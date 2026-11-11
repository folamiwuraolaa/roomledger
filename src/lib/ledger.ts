// Pure ledger maths. Money is integer kobo (₦1 = 100 kobo) to avoid float drift.
// In production these calculations must be repeated on the Python backend (authoritative).

export type Member = { id: string; name: string; role: "admin" | "member" };
export type Category = "groceries" | "electricity" | "water" | "internet" | "gas" | "cleaning" | "household";
export type Expense = {
  id: string;
  title: string;
  category: Category;
  amount: number; // kobo
  paidBy: string;
  shares: Record<string, number>; // memberId -> kobo, sums to amount
  date: string; // ISO
  createdBy: string;
};
export type Settlement = { id: string; from: string; to: string; amount: number; date: string };

/** Equal split whose parts always sum exactly to the total. Splits in whole naira when the total is whole naira. */
export function splitEqual(total: number, participants: string[]): Record<string, number> {
  const n = participants.length;
  if (n === 0) return {};
  const unit = total % 100 === 0 ? 100 : 1;
  const units = total / unit;
  const base = Math.floor(units / n);
  let rem = units - base * n;
  const out: Record<string, number> = {};
  for (const p of participants) {
    out[p] = (base + (rem > 0 ? 1 : 0)) * unit;
    if (rem > 0) rem--;
  }
  return out;
}

/** Net balance = paid − share − settlements made + settlements received… inverted sign for settlements made (paying reduces debt). */
export function netBalances(members: Member[], expenses: Expense[], settlements: Settlement[]) {
  const bal: Record<string, number> = Object.fromEntries(members.map((m) => [m.id, 0]));
  for (const e of expenses) {
    bal[e.paidBy] = (bal[e.paidBy] ?? 0) + e.amount;
    for (const [id, s] of Object.entries(e.shares)) bal[id] = (bal[id] ?? 0) - s;
  }
  // Paying a debt moves you towards zero: payer's balance rises, receiver's falls.
  for (const s of settlements) {
    bal[s.from] = (bal[s.from] ?? 0) + s.amount;
    bal[s.to] = (bal[s.to] ?? 0) - s.amount;
  }
  return bal;
}

export type Debt = { from: string; to: string; amount: number };

/** Pairwise debts between roommates, netted per pair, after settlements. */
export function pairwiseDebts(expenses: Expense[], settlements: Settlement[]): Debt[] {
  const m = new Map<string, number>(); // "a|b" with a<b : positive => a owes b
  const add = (from: string, to: string, amt: number) => {
    if (from === to) return;
    const [a, b] = from < to ? [from, to] : [to, from];
    const k = `${a}|${b}`;
    m.set(k, (m.get(k) ?? 0) + (from === a ? amt : -amt));
  };
  for (const e of expenses) for (const [id, s] of Object.entries(e.shares)) add(id, e.paidBy, s);
  for (const s of settlements) add(s.to, s.from, s.amount);
  const out: Debt[] = [];
  for (const [k, v] of m) {
    const [a, b] = k.split("|") as [string, string];
    if (v > 0) out.push({ from: a, to: b, amount: v });
    else if (v < 0) out.push({ from: b, to: a, amount: -v });
  }
  return out.sort((x, y) => y.amount - x.amount);
}

export function formatNaira(kobo: number, opts: { sign?: boolean } = {}) {
  const abs = Math.abs(kobo) / 100;
  const str = abs.toLocaleString("en-NG", { minimumFractionDigits: abs % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const sign = kobo < 0 ? "−" : opts.sign && kobo > 0 ? "+" : "";
  return `${sign}₦${str}`;
}

export function parseNaira(input: string): number | null {
  const n = Number(input.replace(/[₦,\s]/g, ""));
  if (!isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}
