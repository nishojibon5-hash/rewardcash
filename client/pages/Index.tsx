import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ShareBar from "@/components/ShareBar";
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
              background: `hsl(${(i * 35) % 360} 90% 60% / 0.9)`,
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
        <p className="text-sm sm:text-base font-medium text-slate-800">
          Complete the task and return after the timer. Reward unlocks in
        </p>
        <span className="font-extrabold text-slate-900 tabular-nums text-lg sm:text-xl">
          {mm}:{ss}
        </span>
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
    const kinds = [
      "Survey",
      "Dating",
      "Cashback",
      "Quiz",
      "Sign‑Up",
      "Spin & Win",
    ] as const;
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
      "Spin & Win": ["One spin per day", "Lucky draw", "High chances"],
    };

    const total = 120; // between 100-200
    const base = Array.from({ length: total }).map((_, i) => ({ id: i + 1 }));
    const pool = (
      state.customOfferLinks.length ? state.customOfferLinks : DEFAULT_LINKS
    ).slice();
    return base.map((o) => {
      let link = pool[Math.floor(rand() * pool.length)] || "#"; // all buttons use Monetag links randomly
      if (o.id === 1) link = "https://otieu.com/4/9841368"; // force first button to this link
      const rating = 4 + Math.floor(rand() * 2); // 4-5
      const count = 500 + Math.floor(rand() * 5000);
      const earn = Math.round((0.5 + rand() * 4.5) * 100) / 100; // $0.50-$5.00
      const kind = kinds[
        Math.floor(rand() * kinds.length)
      ] as (typeof kinds)[number];
      const title = titles[kind](earn);
      const descList = descs[kind];
      const desc = descList[Math.floor(rand() * descList.length)];
      return { ...o, link, rating, count, earn, kind, title, desc };
    });
  }, [rand, state.customOfferLinks]);

  useEffect(() => {
    let timer: number | undefined;

    const check = () => {
      const pending = localStorage.getItem("pendingOffer");
      if (!pending) {
        setRemainingMs(0);
        return;
      }
      try {
        const data = JSON.parse(pending) as {
          id: number;
          t: number;
          earn?: number;
        };
        const unlockAt = data.t + 30000; // 30s
        const remain = unlockAt - Date.now();
        setRemainingMs(Math.max(0, remain));
        if (remain <= 0) {
          const add = typeof data.earn === "number" ? data.earn : 0;
          if (add > 0) award(add);
          localStorage.removeItem("pendingOffer");
          setShowBalloons(true);
          setShowConfetti(true);
          setTimeout(() => setShowBalloons(false), 4000);
        }
      } catch {
        setRemainingMs(0);
      }
    };

    timer = window.setInterval(check, 1000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    check();

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [award]);

  const clickOffer = (id: number, _link: string, earn: number) => {
    localStorage.setItem(
      "pendingOffer",
      JSON.stringify({ id, t: Date.now(), earn }),
    );
    // Direct navigation handled by anchor default behavior
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

      <section className="p-5 sm:p-8 bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Earn Up To $7 Fast — Top Target USA • Available Worldwide
            </h1>
            <p className="text-slate-700 mt-2 text-sm sm:text-base">
              Tap an offer, complete it, return after 30s and claim instant
              cash. No signup. Your balance is tracked by IP.
            </p>
          </div>
          <div className="text-right text-xs sm:text-sm text-slate-600">
            <p className="font-semibold">Top Target: USA • All countries supported</p>
            <p className="opacity-80">
              {isUS ? "US timezone detected" : "Non‑US timezone"}
            </p>
            <p className="opacity-80">IP: {ip || "detecting…"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="col-span-2 flex items-center gap-3 text-sm text-slate-700">
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
              No Login
            </span>
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
              Device-based Rewards
            </span>
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
              Fireworks + Balloons
            </span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-slate-900">
              {balance}
            </span>
            <span className="ml-2 text-sm text-slate-600">USD</span>
          </div>
        </div>
      </section>

      <ShareBar className="px-4 sm:px-6" />

      <section className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Today’s Hottest Payouts</h2>
          <p className="text-sm text-slate-600">
            Tap any button to start — complete per instructions (visit/app
            install/survey/register). Stay 30s, then return to claim.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {offers.map((o) => (
            <article
              key={o.id}
              className="group p-3 bg-white hover:shadow transition"
            >
              <div className="flex items-center justify-between text-slate-900">
                <span className="text-sm font-semibold">
                  ⚡ Instant Reward • ${o.earn.toFixed(2)}
                </span>
                <span className="text-xs text-amber-500">
                  {"★".repeat(o.rating)}
                  {"☆".repeat(5 - o.rating)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">0 জন সম্পন্ন করেছে</p>
              <p className="mt-2 text-lg font-bold text-blue-700">
                ${o.earn.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Do the task as instructed (visit/app install/survey/register).
                Stay 30s on the site, then return to claim.
              </p>
              <Button
                asChild
                className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <a
                  href={o.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => clickOffer(o.id, o.link, o.earn)}
                >
                  ${o.earn.toFixed(2)}
                </a>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="p-5 sm:p-6">
        <h2 className="text-lg font-bold">কিভাবে কাজ করে?</h2>
        <ol className="mt-2 text-sm space-y-1 text-slate-700 list-decimal pl-5">
          <li>��েকোনো অফার বাটনে ক্লিক করুন।</li>
          <li>সাইটে ৩০ সেকেন্ড কাজ কর���ন (কাউন্টডাউন শেষ না হওয়া পর্যন্ত)।</li>
          <li>ফিরে এলে বেলুন + আতশবাজি দেখাবে এবং আয় ব্যালেন্সে যুক্ত হবে।</li>
          <li>ব্যালেন্স $100 হলে উইথড্র নিন।</li>
        </ol>
      </section>
    </div>
  );
}
