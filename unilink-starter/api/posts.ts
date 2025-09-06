import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_supabase";
import { applyCORS, handleOptions } from "./_cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCORS(req, res);

  try {
    if (req.method === "GET") {
      const { q, limit = "24", offset = "0" } = req.query as Record<string, string>;
      let query = supabase.from("posts").select("*").order("created_at", { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
      if (q) query = query.ilike("title", `%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ data });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { title, content, desc, price, type, fcountry, school, campus, contact, urgent, user_id } = body || {};
      if (!title) return res.status(400).json({ error: "title required" });
      const { data, error } = await supabase.from("posts").insert([{
        title, content: content || desc || "", price, type, country: fcountry, school, campus, contact, urgent, user_id
      }]).select().single();
      if (error) throw error;
      return res.status(201).json({ data });
    }

    res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[posts]", e);
    res.status(500).json({ error: e.message || "server error" });
  }
}
