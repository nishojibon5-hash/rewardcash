import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleStartStreamAdvanced,
  handleStopStreamAdvanced,
  handleConnectPlatformAdvanced,
  handleDisconnectPlatformAdvanced,
  handleGetStreamStatusAdvanced,
  handleGetActiveStreamsAdvanced,
  handleGetConnectedPlatformsAdvanced,
  handleCheckFFmpeg,
  handleExtractVideo,
} from "./routes/stream-advanced";

type Totals = {
  visits: number;
  tasks: number;
  perCountry: Record<string, { visits: number; tasks: number }>;
  recent: { type: "visit" | "task"; country: string; at: number }[];
};

const totals: Totals = {
  visits: 0,
  tasks: 0,
  perCountry: {},
  recent: [],
};

const sseClients: Set<import("express").Response> = new Set();

function pickCountry(req: import("express").Request): string {
  const h = (name: string) => (req.headers[name] as string) || "";
  const code = (
    h("cf-ipcountry") ||
    h("x-vercel-ip-country") ||
    h("x-country") ||
    h("x-geo-country") ||
    h("fastly-country-code") ||
    ""
  )
    .toString()
    .trim()
    .toUpperCase();
  if (code) return code;
  const al = h("accept-language");
  const m = /-([A-Z]{2})\b/.exec(al);
  if (m) return m[1];
  return "UN";
}

function bump(kind: "visit" | "task", country: string) {
  if (kind === "visit") totals.visits += 1;
  else totals.tasks += 1;
  const entry = (totals.perCountry[country] ||= { visits: 0, tasks: 0 });
  if (kind === "visit") entry.visits += 1;
  else entry.tasks += 1;
  totals.recent.unshift({ type: kind, country, at: Date.now() });
  totals.recent = totals.recent.slice(0, 50);
  const payload = JSON.stringify({
    type: kind,
    totals,
    country,
    at: Date.now(),
  });
  for (const res of sseClients) {
    res.write(`event: update\n`);
    res.write(`data: ${payload}\n\n`);
  }
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Streaming API routes
  app.post("/api/stream/start", handleStartStream);
  app.post("/api/stream/stop", handleStopStream);
  app.post("/api/stream/connect", handleConnectPlatform);
  app.post("/api/stream/disconnect", handleDisconnectPlatform);
  app.get("/api/stream/:streamId", handleGetStreamStatus);
  app.get("/api/stream", handleGetActiveStreams);
  app.get("/api/stream/platforms/connected", handleGetConnectedPlatforms);

  // Metrics: initial state
  app.get("/api/metrics/state", (_req, res) => {
    res.json(totals);
  });

  // Metrics: Server-Sent Events stream
  app.get("/api/metrics/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    (res as any).flushHeaders?.();

    sseClients.add(res);

    const snapshot = JSON.stringify({ type: "state", totals, at: Date.now() });
    res.write(`event: update\n`);
    res.write(`data: ${snapshot}\n\n`);

    const keep = setInterval(() => res.write(":\n\n"), 15000);
    req.on("close", () => {
      clearInterval(keep);
      sseClients.delete(res);
    });
  });

  // Metrics: count a visit
  app.post("/api/metrics/visit", (req, res) => {
    const country = pickCountry(req);
    bump("visit", country);
    res.json({ ok: true });
  });

  // Metrics: count a completed task
  app.post("/api/metrics/task", (req, res) => {
    const country = pickCountry(req);
    bump("task", country);
    res.json({ ok: true });
  });

  // Basic dynamic sitemap for SEO (free traffic)
  app.get("/sitemap.xml", (req, res) => {
    const origin = `${req.protocol}://${req.headers.host}`;
    const baseUrls = ["/", "/withdraw", "/admin", "/counter"];
    let landingUrls: string[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const landings = require("../shared/landings");
      const list = (landings.LANDINGS || []) as Array<{ slug: string }>;
      landingUrls = list.map((l) => `/l/${l.slug}`);
    } catch {}
    const urls = [...baseUrls, ...landingUrls];
    const today = new Date().toISOString().slice(0, 10);
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls
        .map(
          (u) =>
            `\n  <url>\n    <loc>${origin}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${u === "/" ? "1.0" : "0.8"}</priority>\n  </url>`,
        )
        .join("") +
      `\n</urlset>`;
    res.set("Content-Type", "application/xml").send(xml);
  });

  // Get client IP (best-effort)
  app.get("/api/ip", (req, res) => {
    // Express behind proxy may need trust proxy for real IP; this is a best-effort fallback
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "";
    res.json({ ip });
  });

  // Receive withdrawal requests (demo only)
  app.post("/api/withdraw", (req, res) => {
    const { address, amount } = req.body ?? {};
    if (
      !address ||
      typeof address !== "string" ||
      !amount ||
      Number.isNaN(Number(amount))
    ) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    const id = `wd_${Date.now().toString(36)}`;
    // In a real app, enqueue on a secure backend/wallet service. Here we just ACK.
    res.json({ ok: true, id });
  });

  return app;
}
