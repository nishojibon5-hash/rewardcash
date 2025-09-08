import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/app-store";

export default function Withdraw() {
  const navigate = useNavigate();
  const { state, addWithdraw } = useAppStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!name || !address || !amt || amt <= 0) {
      alert("Provide name, valid USDT address and amount");
      return;
    }
    if (amt < 100) {
      alert("Minimum withdrawal is $100");
      return;
    }
    if (amt > state.balance) {
      alert("Amount exceeds available balance");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: amt }),
      });
      const data = await res.json();
      if (data.ok) {
        addWithdraw({ id: data.id, address, amount: amt, ts: Date.now() });
        alert("Request submitted successfully");
        navigate("/");
      } else {
        alert("Failed to submit request");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const recent = [
    {
      id: "wd_A91",
      name: "David R.",
      amount: 128.5,
      ts: Date.now() - 1000 * 60 * 15,
    },
    {
      id: "wd_Z73",
      name: "Mia P.",
      amount: 212.0,
      ts: Date.now() - 1000 * 60 * 42,
    },
    {
      id: "wd_K20",
      name: "Ethan L.",
      amount: 100.0,
      ts: Date.now() - 1000 * 60 * 90,
    },
    {
      id: "wd_Q55",
      name: "Sophia W.",
      amount: 156.75,
      ts: Date.now() - 1000 * 60 * 240,
    },
  ];

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Withdraw</h1>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-600">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Binance USDT Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500"
            placeholder="Your USDT address"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500"
            placeholder="e.g. 120 (min $100)"
          />
        </div>
        <div className="text-sm text-slate-600">
          Available: {state.balance.toFixed(2)} USD
        </div>
        <Button
          onClick={submit}
          disabled={loading}
          className="w-full bg-slate-900 text-white hover:bg-slate-800"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200"
        >
          Back
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Recent Withdrawals</h2>
        <ul className="divide-y divide-slate-200 bg-white rounded-lg ring-1 ring-slate-200">
          {recent.map((r) => (
            <li key={r.id} className="flex items-center justify-between p-3">
              <div className="text-sm text-slate-700">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(r.ts).toLocaleString()}
                </p>
              </div>
              <div className="text-sm font-semibold text-emerald-700">
                ${r.amount.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
