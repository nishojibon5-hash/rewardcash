export default async function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const { address, amount } = req.body || {};
    if (
      !address ||
      typeof address !== "string" ||
      Number.isNaN(Number(amount))
    ) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    const id = `wd_${Date.now().toString(36)}`;
    return res.status(200).json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
