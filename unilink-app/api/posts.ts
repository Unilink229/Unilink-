import { supabaseAdmin } from './_supabase';

export const config = { runtime: 'edge' };

/**
 * API route for posts CRUD.
 *
 * GET /api/posts?country=...&offset=0&limit=20
 * POST /api/posts { type, title, desc, price, country, campus, contact, urgent }
 * PATCH /api/posts { id, status }
 * DELETE /api/posts?id=...
 */
export default async function handler(req: Request) {
  const url = new URL(req.url);

  // GET: list posts
  if (req.method === 'GET') {
    const country = url.searchParams.get('country');
    const from = Number(url.searchParams.get('offset') || '0');
    const to = from + Number(url.searchParams.get('limit') || '20') - 1;
    let query = supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (country) query = query.eq('country', country);
    const { data, error } = await query;
    return json({ ok: !error, data, error });
  }

  // POST: create a new post
  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { body = {}; }
    if (!body.title || !body.type || !body.country) {
      return json({ ok: false, error: 'missing fields' }, 400);
    }
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([
        {
          user_id: body.user_id || null,
          type: body.type,
          title: body.title,
          desc: body.desc || '',
          price: Number(body.price || 0),
          country: body.country,
          campus: body.campus || '',
          contact: body.contact || '',
          urgent: !!body.urgent,
          status: 'open'
        }
      ])
      .select()
      .single();
    return json({ ok: !error, data, error }, error ? 500 : 200);
  }

  // PATCH: update post status
  if (req.method === 'PATCH') {
    let body: any;
    try { body = await req.json(); } catch { body = {}; }
    if (!body.id || !body.status) {
      return json({ ok: false, error: 'missing id/status' }, 400);
    }
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({ status: body.status })
      .eq('id', body.id)
      .select()
      .single();
    return json({ ok: !error, data, error }, error ? 500 : 200);
  }

  // DELETE: delete a post by id
  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return json({ ok: false, error: 'missing id' }, 400);
    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
    return json({ ok: !error, error }, error ? 500 : 200);
  }

  return new Response('Method Not Allowed', { status: 405 });
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}