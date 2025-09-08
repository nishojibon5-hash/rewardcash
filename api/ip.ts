export default function handler(req: any, res: any) {
  const xf = (req.headers?.["x-forwarded-for"] as string) || "";
  const ip = xf.split(",")[0].trim() || req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "";
  res.status(200).json({ ip });
}
