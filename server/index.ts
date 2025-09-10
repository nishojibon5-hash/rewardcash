import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

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

  // Basic dynamic sitemap for SEO (free traffic)
  app.get("/sitemap.xml", (req, res) => {
    const origin = `${req.protocol}://${req.headers.host}`;
    const urls = ["/", "/withdraw", "/admin"];
    const today = new Date().toISOString().slice(0, 10);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.map((u) => `\n  <url>\n    <loc>${origin}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${u === "/" ? "1.0" : "0.8"}</priority>\n  </url>`).join("") +
      `\n</urlset>`;
    res.set("Content-Type", "application/xml").send(xml);
  });

  // Get client IP (best-effort)
  app.get("/api/ip", (req, res) => {
    // Express behind proxy may need trust proxy for real IP; this is a best-effort fallback
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "";
    res.json({ ip });
  });

  // Receive withdrawal requests (demo only)
  app.post("/api/withdraw", (req, res) => {
    const { address, amount } = req.body ?? {};
    if (!address || typeof address !== "string" || !amount || Number.isNaN(Number(amount))) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    const id = `wd_${Date.now().toString(36)}`;
    // In a real app, enqueue on a secure backend/wallet service. Here we just ACK.
    res.json({ ok: true, id });
  });

  return app;
}
