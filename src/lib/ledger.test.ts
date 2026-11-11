import { describe, expect, it } from "vitest";
import { formatNaira, netBalances, pairwiseDebts, splitEqual, type Expense } from "./ledger";

const members = ["w", "t", "a", "j"].map((id) => ({ id, name: id, role: "member" as const }));
const groceries: Expense = { id: "e", title: "Groceries", category: "groceries", amount: 4_000_000, paidBy: "w", shares: splitEqual(4_000_000, ["w", "t", "a", "j"]), date: "", createdBy: "w" };

describe("ledger", () => {
  it("splits ₦40,000 between 4 as ₦10,000 each", () => {
    expect(Object.values(groceries.shares)).toEqual([1_000_000, 1_000_000, 1_000_000, 1_000_000]);
  });
  it("splits ₦10,000 between 3 as ₦3,334 + ₦3,333 + ₦3,333", () => {
    expect(Object.values(splitEqual(1_000_000, ["a", "b", "c"]))).toEqual([333_400, 333_300, 333_300]);
  });
  it("payer is owed ₦30,000 and others owe ₦10,000", () => {
    const b = netBalances(members, [groceries], []);
    expect(b).toEqual({ w: 3_000_000, t: -1_000_000, a: -1_000_000, j: -1_000_000 });
  });
  it("settling a debt zeroes it", () => {
    const s = [{ id: "s", from: "t", to: "w", amount: 1_000_000, date: "" }];
    expect(netBalances(members, [groceries], s)["t"]).toBe(0);
    expect(pairwiseDebts([groceries], s).find((d) => d.from === "t")).toBeUndefined();
  });
  it("formats naira", () => {
    expect(formatNaira(750_050)).toBe("₦7,500.50");
    expect(formatNaira(1_250_000, { sign: true })).toBe("+₦12,500");
  });
});
