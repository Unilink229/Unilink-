import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("⚠️ Supabase 环境变量缺失：请在 Vercel 设置 SUPABASE_URL/SUPABASE_ANON_KEY 或 NEXT_PUBLIC_*");
}

export const supabase = createClient(url as string, anonKey as string, {
  auth: { persistSession: false }
});
