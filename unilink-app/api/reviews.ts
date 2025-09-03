import { supabaseAdmin } from './_supabase';

export const config = { runtime: 'edge' };

// GET reviews with optional filters; POST new review
export default async function handler(req: Request) {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const school = url.searchParams.get('school') || '';
    const country = url.searchParams.get('country');
    let query = supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (school) query = query.ilike('school', `%${school}%`);
    if (country) query = query.eq('country', country);
    const { data, error } = await query;
    return json({ ok: !error, data, error });
  }
  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { body = {}; }
    if (!body.school) return json({ ok: false, error: 'missing school' }, 400);
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([
        {
          user_id: body.user_id || null,
          school: body.school,
          major: body.major || null,
          course: body.course || null,
          life: body.life || null,
          career: body.career || null,
          score: body.score || null,
          country: body.country || null
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