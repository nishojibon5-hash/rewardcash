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

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Withdraw</h1>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-600">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500" placeholder="Your name" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Binance USDT Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500" placeholder="Your USDT address" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full mt-1 rounded-lg bg-white p-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-slate-500" placeholder="e.g. 10" />
        </div>
        <div className="text-sm text-slate-600">Available: {state.balance}</div>
        <Button onClick={submit} disabled={loading} className="w-full bg-slate-900 text-white hover:bg-slate-800">{loading ? "Submitting..." : "Submit"}</Button>
        <Button onClick={() => navigate("/")} variant="secondary" className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200">Back</Button>
      </div>
    </div>
  );
}
