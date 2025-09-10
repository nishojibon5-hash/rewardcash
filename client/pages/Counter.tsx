import { useEffect, useMemo, useRef, useState } from "react";

function useDisplayNames() {
  const dn = useMemo(() => {
    try {
      return new (Intl as any).DisplayNames(undefined, { type: "region" });
    } catch {
      return null;
    }
  }, []);
  return (code: string) => {
    if (!code || code === "UN") return "Unknown";
    if (!dn) return code;
    try {
      return dn.of(code) || code;
    } catch {
      return code;
    }
  };
}

export default function Counter() {
  const [totals, setTotals] = useState<{
    visits: number;
    tasks: number;
    perCountry: Record<string, { visits: number; tasks: number }>;
    recent: { type: "visit" | "task"; country: string; at: number }[];
  }>({ visits: 0, tasks: 0, perCountry: {}, recent: [] });
  const liveRef = useRef<EventSource | null>(null);
  const countryName = useDisplayNames();

  useEffect(() => {
    let es: EventSource | null = null;
    fetch("/api/metrics/state")
      .then((r) => r.json())
      .then(setTotals)
      .catch(() => {});
    es = new EventSource("/api/metrics/stream");
    es.addEventListener("update", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.totals) setTotals(payload.totals);
      } catch {}
    });
    liveRef.current = es;
    return () => {
      es?.close();
    };
  }, []);

  const countries = useMemo(() => {
    const entries = Object.entries(totals.perCountry);
    entries.sort(
      (a, b) => b[1].visits + b[1].tasks - (a[1].visits + a[1].tasks),
    );
    return entries;
  }, [totals.perCountry]);

  return (
    <div className="space-y-6">
      <section className="p-5 sm:p-8 bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50 rounded-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          Live Traffic & Task Counter
        </h1>
        <p className="text-slate-700 mt-2 text-sm sm:text-base">
          Real‑time visitors, task completions, and origin countries.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Site Visits</p>
          <p className="text-4xl font-extrabold tabular-nums">
            {totals.visits}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Task Works</p>
          <p className="text-4xl font-extrabold tabular-nums">{totals.tasks}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Active Feed</p>
          <p className="text-xs text-slate-700">Updates stream live below</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold">By Country</h2>
          <ul className="mt-3 space-y-2">
            {countries.slice(0, 20).map(([code, v]) => {
              const total = v.visits + v.tasks;
              return (
                <li key={code} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-slate-700">
                    {countryName(code)} ({code})
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded">
                    <div
                      className="h-2 rounded bg-blue-600"
                      style={{
                        width:
                          Math.min(
                            100,
                            total
                              ? (total /
                                  (countries[0]?.[1].visits +
                                    countries[0]?.[1].tasks)) *
                                  100
                              : 0,
                          ) + "%",
                      }}
                    />
                  </div>
                  <div className="w-24 text-right tabular-nums text-sm text-slate-700">
                    V {v.visits} · T {v.tasks}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold">Live Feed</h2>
          <ul className="mt-3 space-y-2 max-h-96 overflow-auto">
            {totals.recent.map((e, i) => (
              <li
                key={i}
                className="text-sm text-slate-700 flex items-center justify-between"
              >
                <span className="font-semibold">
                  {e.type === "visit" ? "Visit" : "Task"}
                </span>
                <span>
                  {countryName(e.country)} ({e.country})
                </span>
                <span className="tabular-nums text-slate-500">
                  {new Date(e.at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
