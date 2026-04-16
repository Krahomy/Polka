const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const { q } = await req.json();
  if (!q || typeof q !== 'string' || q.trim() === '') {
    return new Response(JSON.stringify([]), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const url = `https://api.litres.ru/foundation/api/arts?q=${encodeURIComponent(q.trim())}&limit=20&types=text_book`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const json = await res.json();
  const books = (json?.payload?.data ?? []).map((item: Record<string, unknown>) => {
    const persons = Array.isArray(item.persons) ? item.persons : [];
    const author = persons.find((p: Record<string, unknown>) => p.role === 'author');
    return {
      id: item.id,
      title: item.title,
      author: author ? author.full_name : '',
      coverUrl: `https://cdn.litres.ru${item.cover_url}`,
    };
  });

  return new Response(JSON.stringify(books), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
