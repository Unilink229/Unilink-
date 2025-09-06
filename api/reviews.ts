// api/reviews.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import supabase from './_supabase'

function withCORS(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
const ok = (res: VercelResponse, data: any, code = 200) => { withCORS(res); return res.status(code).json(data) }
const bad = (res: VercelResponse, msg: string, code = 400) => { withCORS(res); return res.status(code).json({ error: msg }) }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  withCORS(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    if (req.method === 'GET') {
      const { school_id, limit = '50', offset = '0' } = (req.query || {}) as Record<string, string>
      let query = supabase
        .from('school_reviews')
        .select('*, profiles:user_id(email,wechat,verification_level,verification_expires_at)')
        .order('pinned', { ascending: false })
        .order('verified', { ascending: false })
        .order('created_at', { ascending: false })

      if (school_id) query = query.eq('school_id', school_id)

      const from = Number(offset)
      const to   = from + Number(limit) - 1
      query = query.range(from, to)

      const { data, error } = await query
      if (error) return bad(res, error.message, 500)
      return ok(res, { items: data })
    }

    if (req.method === 'POST') {
      // 新增评论（已认证留学生可带 score）
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const required = ['school_id', 'user_id', 'text']
      for (const k of required) {
        if (!body[k]) return bad(res, `缺少必填字段：${k}`)
      }

      const payload = {
        school_id: String(body.school_id),
        user_id: String(body.user_id),
        text: String(body.text).slice(0, 4000),
        score: typeof body.score === 'number' ? Math.max(1, Math.min(5, body.score)) : null,
        images: Array.isArray(body.images) ? body.images.slice(0, 3) : [],
        verified: !!body.verified,
        pinned: !!body.pinned,
        reports: [],
      }

      const { data, error } = await supabase.from('school_reviews').insert(payload).select().single()
      if (error) return bad(res, error.message, 500)
      return ok(res, data, 201)
    }

    return bad(res, 'Method Not Allowed', 405)
  } catch (e: any) {
    return bad(res, e?.message || 'Server Error', 500)
  }
}
