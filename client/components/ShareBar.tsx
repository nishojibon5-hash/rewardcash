import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

function encode(u: string) {
  return encodeURIComponent(u);
}

export default function ShareBar({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const { shareUrl, shareText } = useMemo(() => {
    const loc =
      typeof window !== "undefined" ? window.location : ({} as Location);
    const origin = loc?.origin || "";
    const path = loc?.pathname || "/";
    const url = `${origin}${path}?utm_source=share&utm_medium=social&utm_campaign=free_traffic`;
    return {
      shareUrl: url,
      shareText: "Earn rewards fast — Top Target USA • Available Worldwide",
    };
  }, []);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const canWebShare =
    typeof navigator !== "undefined" && (navigator as any).share;

  const buttons = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encode(`${shareText} ${shareUrl}`)}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`,
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encode(shareUrl)}&text=${encode(shareText)}`,
    },
    {
      name: "Reddit",
      href: `https://www.reddit.com/submit?url=${encode(shareUrl)}&title=${encode(shareText)}`,
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(shareText)}`,
    },
  ];

  const webShare = async () => {
    try {
      await (navigator as any).share({
        title: shareText,
        text: shareText,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <section className={`py-3 sm:py-4 ${className}`}>
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Share & Invite — Free traffic
          </p>
          <p className="text-xs text-slate-600">
            Share this page to get more visitors from social channels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canWebShare ? (
            <Button
              onClick={webShare}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Share
            </Button>
          ) : (
            buttons.map((b) => (
              <a
                key={b.name}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md bg-slate-900 text-white text-xs hover:bg-slate-800"
              >
                {b.name}
              </a>
            ))
          )}
          <Button variant="outline" onClick={doCopy} className="text-xs">
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>
    </section>
  );
}
