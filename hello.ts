import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCORS, handleOptions } from "./_cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCORS(req, res);
  res.status(200).json({ ok: true, msg: "Unilink API 正常运行 🚀", time: Date.now() });
}
