import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_supabase";
import { applyCORS, handleOptions } from "./_cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCORS(req, res);

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { content, type = "general", images = [], contact = "", user_id } = body || {};
      if (!content) return res.status(400).json({ error: "content required" });
      const { data, error } = await supabase.from("feedback").insert([{ content, type, images, contact, user_id }]).select().single();
      if (error) throw error;
      return res.status(201).json({ data });
    }

    if (req.method === "GET") {
      const { limit = "50", offset = "0" } = req.query as Record<string, string>;
      const { data, error } = await supabase.from("feedback").select("*")
        .order("created_at", { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
      if (error) throw error;
      return res.status(200).json({ data });
    }

    res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[feedback]", e);
    res.status(500).json({ error: e.message || "server error" });
  }
}
