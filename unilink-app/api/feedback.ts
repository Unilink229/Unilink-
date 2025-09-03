import { supabaseAdmin } from './_supabase';

export const config = { runtime: 'edge' };

// GET list of feedbacks; POST new feedback
export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    return json({ ok: !error, data, error });
  }
  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { body = {}; }
    if (!body.content) {
      return json({ ok: false, error: 'missing content' }, 400);
    }
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert([
        {
          user_id: body.user_id || null,
          kind: body.kind || '其它',
          content: body.content || '',
          contact: body.contact || ''
        }
      ])
      .select()
      .single();
    return json({ ok: !error, data, error }, error ? 500 : 200);
  }
  return new Response('Method Not Allowed', { status: 405 });
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}