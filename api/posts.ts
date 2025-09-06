// api/posts.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import supabase from './_supabase'

// —— 简单 CORS（允许前端直接调用这些接口）
function withCORS(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
const ok = (res: VercelResponse, data: any, code = 200) => { withCORS(res); return res.status(code).json(data) }
const bad = (res: VercelResponse, msg: string, code = 400) => { withCORS(res); return res.status(code).json({ error: msg }) }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  withCORS(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    if (req.method === 'GET') {
      // 支持筛选：type / country / school / status / q（搜索）
      const { type, country, school, status, q, limit = '50', offset = '0' } = (req.query || {}) as Record<string, string>

      let query = supabase.from('posts').select('*', { count: 'exact' }).order('created_at', { ascending: false })

      if (type)   query = query.eq('type', type)
      if (status) query = query.eq('status', status)
      if (country) query = query.eq('country', country)
      if (school)  query = query.eq('school', school)
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

      const from = Number(offset)
      const to   = from + Number(limit) - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) return bad(res, error.message, 500)
      return ok(res, { items: data, total: count })
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const required = ['type', 'price', 'title', 'description', 'country', 'contact']
      for (const k of required) {
        if (body[k] === undefined || body[k] === null || String(body[k]).trim() === '') {
          return bad(res, `缺少必填字段：${k}`)
        }
      }

      const payload = {
        type: String(body.type),
        price: Number(body.price) || 0,
        title: String(body.title).slice(0, 120),
        description: String(body.description).slice(0, 4000),
        country: String(body.country),
        school: body.school ? String(body.school) : null,
        campus: body.campus ? String(body.campus) : null,
        contact: String(body.contact).slice(0, 120),
        urgent: !!body.urgent,
        status: body.status ? String(body.status) : 'open',
        owner_id: body.owner_id || null, // 前端已登录时可传 auth.users.id
      }

      const { data, error } = await supabase.from('posts').insert(payload).select().single()
      if (error) return bad(res, error.message, 500)
      return ok(res, data, 201)
    }

    if (req.method === 'PATCH') {
      // 用于标记完成、或更新自己的发布
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const { id, ...fields } = body
      if (!id) return bad(res, '缺少 id')

      // 安全起见，只允许更新白名单字段
      const allow = ['price', 'title', 'description', 'country', 'school', 'campus', 'contact', 'urgent', 'status']
      const update: Record<string, any> = {}
      for (const k of allow) {
        if (k in fields) update[k] = fields[k]
      }
      update.updated_at = new Date().toISOString()

      const { data, error } = await supabase.from('posts').update(update).eq('id', id).select().single()
      if (error) return bad(res, error.message, 500)
      return ok(res, data)
    }

    if (req.method === 'DELETE') {
      const { id } = (req.query || {}) as Record<string, string>
      if (!id) return bad(res, '缺少 id')
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) return bad(res, error.message, 500)
      return ok(res, { ok: true })
    }

    return bad(res, 'Method Not Allowed', 405)
  } catch (e: any) {
    return bad(res, e?.message || 'Server Error', 500)
  }
}
