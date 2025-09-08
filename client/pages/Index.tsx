import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

// Default links provided by user
const DEFAULT_LINKS: string[] = [
  "https://otieu.com/4/9841368",
  "https://otieu.com/4/9839204",
  "https://otieu.com/4/9839798",
  "https://otieu.com/4/9839995",
  "https://otieu.com/4/9839799",
  "https://otieu.com/4/9842528",
  "https://otieu.com/4/9842529",
  "https://otieu.com/4/9842531",
  "https://otieu.com/4/9842532",
  "https://otieu.com/4/9842533",
  "https://otieu.com/4/9842539",
  "https://otieu.com/4/9842541",
  "https://otieu.com/4/9842544",
  "https://otieu.com/4/9842545",
  "https://otieu.com/4/9842546",
  "https://otieu.com/4/9842548",
  "https://otieu.com/4/9842550",
  "https://otieu.com/4/9842551",
  "https://otieu.com/4/9842552",
  "https://otieu.com/4/9842545",
];

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useIPWithStore() {
  const { state, setIp } = useAppStore();
  useEffect(() => {
    if (!state.ip) {
      fetch("/api/ip")
        .then((r) => r.json())
        .then((d) => setIp(d.ip ?? ""))
        .catch(() => {});
    }
  }, [state.ip, setIp]);
  return state.ip;
}

function useUSLike() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return /America\//.test(tz);
}


function Confetti({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!show || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let frame = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const N = 200;
    const parts = Array.from({ length: N }).map((_, i) => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      r: 4 + Math.random() * 6,
      c: `hsl(${Math.random() * 360} 90% 60%)`,
      vy: 2 + Math.random() * 3,
      vx: -2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: -0.1 + Math.random() * 0.2,
    }));

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height + 40) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const timeout = setTimeout(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      onDone?.();
    }, 4000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
}

function Balloons({ show }: { show: boolean }) {
  if (!show) return null;
  const balloons = Array.from({ length: 12 });
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      <div className="absolute inset-0">
        {balloons.map((_, i) => (
          <div
            key={i}
            className="absolute bottom-[-120px] w-8 h-10 rounded-t-full"
            style={{
              left: `${(i + 1) * (100 / 13)}%`,
              background:
                `hsl(${(i * 35) % 360} 90% 60% / 0.9)`,
              animation: `rise ${6 + (i % 5)}s ease-in ${i * 0.2}s forwards`,
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes rise { from { transform: translate(-50%, 0) } to { transform: translate(-50%, -120vh) } }`}</style>
    </div>
  );
}

function CountdownBanner({ remainingMs }: { remainingMs: number }) {
  const secs = Math.max(0, Math.ceil(remainingMs / 1000));
  const mm = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-2xl m-3 rounded-xl border border-slate-200 bg-white shadow-lg p-3 sm:p-4 flex items-center justify-between">
        <p className="text-sm sm:text-base font-medium text-slate-800">Complete the task and return after the timer. Reward unlocks in</p>
        <span className="font-extrabold text-slate-900 tabular-nums text-lg sm:text-xl">{mm}:{ss}</span>
      </div>
    </div>
  );
}

export default function Index() {
  const { state, award, addWithdraw } = useAppStore();
  const ip = useIPWithStore();
  const isUS = useUSLike();
  const balance = state.balance;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [remainingMs, setRemainingMs] = useState<number>(0);

  // Seed based on date for stable layout each day
  const seed = useMemo(() => {
    const d = new Date();
    return Number(`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`);
  }, []);
  const rand = useMemo(() => mulberry32(seed), [seed]);

  const offers = useMemo(() => {
    const kinds = ["Survey", "Dating", "Cashback", "Quiz", "Sign‑Up", "Spin & Win"] as const;
    const titles: Record<string, (earn: number) => string> = {
      Survey: (e) => `2‑Min Survey • Earn $${e.toFixed(2)}`,
      Dating: (e) => `Find Matches • Claim $${e.toFixed(2)}`,
      Cashback: (e) => `Instant Cashback • Get $${e.toFixed(2)}`,
      Quiz: (e) => `Quick Quiz • Win $${e.toFixed(2)}`,
      "Sign‑Up": (e) => `Free Sign‑Up • Bonus $${e.toFixed(2)}`,
      "Spin & Win": (e) => `Spin & Win • Up to $${e.toFixed(2)}`,
    };
    const descs: Record<string, string[]> = {
      Survey: ["Answer a few questions", "No login required", "Fast approval"],
      Dating: ["Meet locals near you", "18+ only", "Verified profiles"],
      Cashback: ["Shop & save instantly", "Limited time", "US only"],
      Quiz: ["5 simple questions", "Test your IQ", "Get rewarded"],
      "Sign‑Up": ["Join free today", "Email only", "Welcome bonus"],
      "Spin & Win": ["One spin per day", "Lucky draw", "High chances"]
    };

    const total = 120; // between 100-200
    const base = Array.from({ length: total }).map((_, i) => ({ id: i + 1 }));
    const pool = (state.customOfferLinks.length ? state.customOfferLinks : DEFAULT_LINKS).slice();
    const minSpecial = 20;
    const specialCount = Math.max(minSpecial, Math.round(total * 0.2));
    const indices = new Set<number>();
    while (indices.size < specialCount) {
      indices.add(Math.floor(rand() * total));
    }
    return base.map((o, i) => {
      const linked = indices.has(i) && pool.length > 0;
      const link = linked ? pool[Math.floor(rand() * pool.length)] : "#";
      const rating = 4 + Math.floor(rand() * 2); // 4-5
      const count = 500 + Math.floor(rand() * 5000);
      const earn = Math.round((0.5 + rand() * 4.5) * 100) / 100; // $0.50-$5.00
      const kind = kinds[Math.floor(rand() * kinds.length)] as (typeof kinds)[number];
      const title = titles[kind](earn);
      const descList = descs[kind];
      const desc = descList[Math.floor(rand() * descList.length)];
      return { ...o, link, linked, rating, count, earn, kind, title, desc };
    });
  }, [rand, state.customOfferLinks]);

  useEffect(() => {
    let interval: number | undefined;
    const check = () => {
      const pending = localStorage.getItem("pendingOffer");
      if (pending) {
        try {
          const data = JSON.parse(pending) as { id: number; t: number };
          const unlockAt = data.t + 60000; // 1 minute
          const now = Date.now();
          const remain = unlockAt - now;
          if (remain <= 0) {
            const awards = [1, 2, 2, 4, 5];
            const add = awards[Math.floor(Math.random() * awards.length)];
            award(add);
            localStorage.removeItem("pendingOffer");
            setRemainingMs(0);
            setShowBalloons(true);
            setShowConfetti(true);
            setTimeout(() => setShowBalloons(false), 4000);
            if (interval) window.clearInterval(interval);
          } else {
            setRemainingMs(remain);
            if (!interval) {
              interval = window.setInterval(() => setRemainingMs((m) => Math.max(0, m - 1000)), 1000);
            }
          }
        } catch {
          setRemainingMs(0);
        }
      } else {
        setRemainingMs(0);
        if (interval) window.clearInterval(interval);
      }
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    check();
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
      if (interval) window.clearInterval(interval);
    };
  }, [award]);

  const clickOffer = (id: number, link: string) => {
    localStorage.setItem("pendingOffer", JSON.stringify({ id, t: Date.now() }));
    if (link && link !== "#") {
      window.location.href = link;
    } else {
      // For generic offers, start the countdown locally
      setRemainingMs(60000);
    }
  };

  const withdraw = async () => {
    const amt = Number(amount);
    if (!address || !amt || amt <= 0) {
      alert("Enter valid USDT address and amount");
      return;
    }
    if (amt > balance) {
      alert("Amount exceeds balance");
      return;
    }
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: amt }),
      });
      const data = await res.json();
      if (data.ok) {
        addWithdraw({ id: data.id, address, amount: amt, ts: Date.now() });
        setAmount("");
        alert(`Withdrawal requested. ID: ${data.id}`);
      } else {
        alert("Failed to submit withdrawal");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <Confetti show={showConfetti} onDone={() => setShowConfetti(false)} />
      <Balloons show={showBalloons} />
      {remainingMs > 0 && <CountdownBanner remainingMs={remainingMs} />}

      <section className="rounded-2xl p-5 sm:p-8 bg-white border border-slate-200 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">লোভনীয় অফার — এখনই আয় শুরু করুন!</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">সার্ভে, ডেটিং, ক্যাশব্যাকসহ নানা ধরনের অফার। ক্লিক করুন, কাজ সম্পূর্ণ করুন, ১ মিনিট পরে ফিরে এলে বেলুন + আতশবাজি আর রিওয়ার্ড যুক্ত হবে।</p>
          </div>
          <div className="text-right text-xs sm:text-sm text-slate-600">
            <p className="font-semibold">Target: United States</p>
            <p className="opacity-80">{isUS ? "US timezone detected" : "Non‑US timezone"}</p>
            <p className="opacity-80">IP: {ip || "detecting…"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="col-span-2 flex items-center gap-3 text-sm text-slate-700">
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">No Login</span>
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">Device-based Rewards</span>
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">Fireworks + Balloons</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-slate-900">{balance}</span>
            <span className="ml-2 text-sm text-slate-600">points</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-md">
        <h2 className="text-xl font-bold mb-4">Balance & Withdraw (USDT)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-600">USDT Address (ERC20/TRC20)</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500" placeholder="Your USDT address" />
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs text-slate-600">Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500" placeholder="e.g. 10" />
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs text-slate-600">Available</label>
            <div className="mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200">{balance}</div>
          </div>
          <div className="sm:col-span-1">
            <Button onClick={withdraw} className="w-full bg-slate-900 text-white hover:bg-slate-800">Withdraw</Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-4 sm:p-6 bg-white border border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Trending Offers</h2>
          <p className="text-sm text-slate-600">Showing {offers.length} offers · ~20% with custom links</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {offers.map((o) => (
            <article key={o.id} className="group rounded-xl p-3 bg-white border border-slate-200 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">#{o.id}</span>
                <span className="text-xs text-amber-500">{"★".repeat(o.rating)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{o.title}</p>
              <p className="text-xs text-slate-600 mt-1">{o.desc} · {o.count.toLocaleString()} doing this</p>
              <Button onClick={() => clickOffer(o.id, o.link)} className="mt-2 w-full bg-slate-900 text-white hover:bg-slate-800">
                Claim ${o.earn.toFixed(2)}
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-md">
        <h2 className="text-lg font-bold">কিভাবে কাজ করে?</h2>
        <ol className="mt-2 text-sm space-y-1 text-slate-700 list-decimal pl-5">
          <li>যেকোনো অফার বাটনে ক্লিক করুন।</li>
          <li>সাইটে ১ মিনিট কাজ করুন (কাউন্টডাউন শেষ না হওয়া পর্যন��ত)।</li>
          <li>ফিরে এলে বেলুন + আতশবাজি দেখাবে এবং পয়েন্ট যুক্ত হবে (১/২/২/৪/৫)।</li>
          <li>পয়েন্ট ব্যালেন্স থেকে USDT তে উইথড্র নিন।</li>
        </ol>
      </section>
    </div>
  );
}
