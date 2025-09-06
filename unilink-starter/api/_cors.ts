import type { VercelRequest, VercelResponse } from "@vercel/node";

export function applyCORS(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleOptions(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    applyCORS(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}
