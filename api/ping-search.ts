export default async function handler(req: any, res: any) {
  const host = (req?.headers?.host as string) || "rewardcash.vercel.app";
  const base = `https://${host}`;
  const sitemap = `${base}/sitemap.xml`;
  try {
    const targets = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    ];
    for (const t of targets) {
      await fetch(t, { method: "GET" });
    }
    return res.status(200).json({ ok: true, sitemap });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
}
