import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

function parseLinks(raw: string): string[] {
  return raw
    .split(/\n|,|\s+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("http"));
}

export default function Admin() {
  const [raw, setRaw] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("customOfferLinks");
    if (stored) {
      try {
        setSaved(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const parsed = useMemo(() => parseLinks(raw), [raw]);

  const save = () => {
    localStorage.setItem("customOfferLinks", JSON.stringify(parsed));
    setSaved(parsed);
  };

  const clear = () => {
    localStorage.removeItem("customOfferLinks");
    setSaved([]);
    setRaw("");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Admin · Manage Offer Links</h1>
      <p className="text-white/80 text-sm">Paste custom offer URLs. The homepage will randomly place ~20% of these links among 100+ offer buttons.</p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste URLs separated by newline, comma or space"
        className="w-full min-h-[12rem] rounded-lg bg-white/10 text-white placeholder:text-white/60 p-4 outline-none ring-2 ring-white/10 focus:ring-white/30"
      />
      <div className="flex gap-3">
        <Button onClick={save} className="bg-white text-black hover:bg-white/90">Save ({parsed.length})</Button>
        <Button onClick={clear} variant="secondary" className="bg-white/10 text-white hover:bg-white/20">Clear</Button>
      </div>
      <div className="text-sm text-white/80">
        <p>Saved links: {saved.length}</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 break-all">
          {saved.map((u, i) => (
            <li key={i} className="truncate">{u}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
