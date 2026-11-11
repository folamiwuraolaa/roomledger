import { useSyncExternalStore } from "react";
import type { Category, Expense, Member, Settlement } from "./ledger";

export type Account = { id: string; name: string; email: string };
export type Notification = { id: string; title: string; body: string; read: boolean; createdAt: string };
export type State = {
  ready: boolean;
  accounts: Account[];
  userId: string | null;
  user: Account | null;
  household: { id: string; name: string; code: string; members: Member[]; myRole: Member["role"] } | null;
  expenses: Expense[];
  settlements: Settlement[];
  notifications: Notification[];
};

const empty: State = {
  ready: false,
  accounts: [],
  userId: null,
  user: null,
  household: null,
  expenses: [],
  settlements: [],
  notifications: [],
};

let state: State = empty;
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const API = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/$/, "");

function notify() { listeners.forEach((l) => l()); }

function applyServer(data: any) {
  const user = data?.user
    ? { id: data.user.id, name: data.user.name, email: data.user.email }
    : null;
  state = {
    ready: true,
    accounts: user ? [user] : [],
    userId: user?.id ?? null,
    user,
    household: data?.household
      ? {
          id: data.household.id,
          name: data.household.name,
          code: data.household.code,
          members: data.household.members,
          myRole: data.household.myRole,
        }
      : null,
    expenses: data?.expenses ?? [],
    settlements: data?.settlements ?? [],
    notifications: data?.notifications ?? [],
  };
  notify();
}

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
  return body;
}

async function load() {
  if (loaded) return;
  if (loading) return loading;
  loading = request("/state")
    .then((data) => applyServer(data))
    .catch(() => {
      // A 401 simply means the visitor is not logged in yet.
      state = { ...empty, ready: true };
    })
    .finally(() => {
      loaded = true;
      loading = null;
      notify();
    });
  return loading;
}

if (typeof window !== "undefined") void load();

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      void load();
      return () => listeners.delete(l);
    },
    () => state,
    () => empty,
  );
}

export const actions = {
  async login(email: string, password: string) {
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      applyServer(data);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Unable to log in. Please try again.";
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      applyServer(data);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Unable to create your account. Please try again.";
    }
  },

  async logout() {
    try { await request("/auth/logout", { method: "POST", body: "{}" }); } finally {
      state = { ...empty, ready: true };
      loaded = true;
      notify();
    }
  },

  async createHousehold(name: string) {
    try {
      const data = await request("/households", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      applyServer(data);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Unable to create the household.";
    }
  },

  async joinHousehold(code: string) {
    try {
      const data = await request("/households/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      applyServer(data);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Unable to join the household.";
    }
  },

  async addExpense(e: {
    title: string;
    category: Category;
    amount: number;
    paidBy: string;
    shares: Record<string, number>;
  }) {
    const data = await request("/expenses", {
      method: "POST",
      body: JSON.stringify(e),
    });
    applyServer(data);
    return data.id as string;
  },

  async deleteExpense(id: string) {
    const data = await request(`/expenses/${id}`, { method: "DELETE" });
    applyServer(data);
  },

  async settle(from: string, to: string, amount: number) {
    // The backend derives the authenticated sender from the session.
    const data = await request("/settlements", {
      method: "POST",
      body: JSON.stringify({ to, amount }),
    });
    applyServer(data);
  },

  async setRole(id: string, role: Member["role"]) {
    const data = await request(`/household/members/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    applyServer(data);
  },

  async removeMember(id: string) {
    const data = await request(`/household/members/${id}`, { method: "DELETE" });
    applyServer(data);
  },

  async markNotificationRead(id: string) {
    await request(`/notifications/${id}/read`, { method: "POST", body: "{}" });
    state = { ...state, notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n) };
    notify();
  },

  async markAllNotificationsRead() {
    await request("/notifications/read-all", { method: "POST", body: "{}" });
    state = { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    notify();
  },
};
