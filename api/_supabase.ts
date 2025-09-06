// api/_supabase.ts
import { createClient } from '@supabase/supabase-js'

// 你的 Supabase 项目地址 & 匿名密钥
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://udshfcppherkuzxxlghr.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkc2hmY3BwaGVya3V6eHhsZ2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjQzOTIsImV4cCI6MjA3MjQ0MDM5Mn0.8razzbs61yRk9bmwr71smYim6auM5Edj_j22Iu6Y9sA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export default supabase
