import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_supabase";
import { applyCORS, handleOptions } from "./_cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCORS(req, res);

  try {
    if (req.method === "GET") {
      const { school_id, limit = "50", offset = "0" } = req.query as Record<string, string>;
      if (!school_id) return res.status(400).json({ error: "school_id required" });
      const { data, error } = await supabase.from("reviews")
        .select("*").eq("school_id", school_id)
        .order("is_verified", { ascending: false })
        .order("created_at", { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
      if (error) throw error;
      return res.status(200).json({ data });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { school_id, rating, content, is_verified = false, user_id } = body || {};
      if (!school_id || rating == null) return res.status(400).json({ error: "school_id & rating required" });
      const { data, error } = await supabase.from("reviews")
        .insert([{ school_id, rating, content, is_verified, user_id }])
        .select().single();
      if (error) throw error;
      return res.status(201).json({ data });
    }

    res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("[reviews]", e);
    res.status(500).json({ error: e.message || "server error" });
  }
}
