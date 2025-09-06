// api/feedback.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import supabase from './_supabase'

function withCORS(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
const ok = (res: VercelResponse, data: any, code = 200) => { withCORS(res); return res.status(code).json(data) }
const bad = (res: VercelResponse, msg: string, code = 400) => { withCORS(res); return res.status(code).json({ error: msg }) }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  withCORS(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return bad(res, 'Method Not Allowed', 405)

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const payload = {
      user_id: body.user_id || null,
      contact: body.contact ? String(body.contact).slice(0, 120) : null,
      category: body.category ? String(body.category).slice(0, 60) : 'general',
      content: String(body.content || '').slice(0, 4000),
      meta: body.meta || {}, // 前端可带一些环境信息
    }
    if (!payload.content) return bad(res, '请填写反馈内容')

    const { data, error } = await supabase.from('feedback').insert(payload).select().single()
    if (error) return bad(res, error.message, 500)
    return ok(res, { ok: true, id: data.id }, 201)
  } catch (e: any) {
    return bad(res, e?.message || 'Server Error', 500)
  }
}
