import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export type Withdraw = { id: string; address: string; amount: number; ts: number };

export type AppState = {
  balance: number;
  customOfferLinks: string[];
  withdraws: Withdraw[];
  ip: string;
  timezone: string;
};

const STORAGE_KEY = "appStore_v1";

const defaultState: AppState = {
  balance: 0,
  customOfferLinks: [],
  withdraws: [],
  ip: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
};

type Action =
  | { type: "hydrate"; payload: Partial<AppState> }
  | { type: "award"; points: number }
  | { type: "setLinks"; links: string[] }
  | { type: "addWithdraw"; withdraw: Withdraw }
  | { type: "setIp"; ip: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload } as AppState;
    case "award":
      return { ...state, balance: Math.max(0, state.balance + action.points) };
    case "setLinks":
      return { ...state, customOfferLinks: action.links };
    case "addWithdraw":
      return {
        ...state,
        balance: Math.max(0, state.balance - action.withdraw.amount),
        withdraws: [action.withdraw, ...state.withdraws].slice(0, 100),
      };
    case "setIp":
      return { ...state, ip: action.ip };
    default:
      return state;
  }
}

const Ctx = createContext<{
  state: AppState;
  award: (points: number) => void;
  setLinks: (links: string[]) => void;
  addWithdraw: (w: Withdraw) => void;
  setIp: (ip: string) => void;
} | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  // Hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", payload: JSON.parse(raw) });
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      award: (points: number) => dispatch({ type: "award", points }),
      setLinks: (links: string[]) => dispatch({ type: "setLinks", links }),
      addWithdraw: (withdraw: Withdraw) => dispatch({ type: "addWithdraw", withdraw }),
      setIp: (ip: string) => dispatch({ type: "setIp", ip }),
    }),
    [state],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
