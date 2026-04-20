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

  const url = `https://api.litres.ru/foundation/api/search?q=${encodeURIComponent(q.trim())}&limit=20&offset=0&o=popular&types=text_book&is_for_pda=false&show_unavailable=false`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  const json = await res.json();
  const books = (json?.payload?.data ?? [])
    .map((item: Record<string, unknown>) => item.instance as Record<string, unknown>)
    .filter((item: Record<string, unknown>) => item?.title)
    .map((item: Record<string, unknown>) => {
      const persons = Array.isArray(item.persons) ? item.persons : [];
      const author = persons.find((p: Record<string, unknown>) => p.role === 'author');
      const symbolsCount = typeof item.symbols_count === 'number' ? item.symbols_count : 0;
      return {
        id: item.id,
        title: item.title,
        author: author ? author.full_name : '',
        coverUrl: `https://cdn.litres.ru${item.cover_url}`,
        pages: symbolsCount > 0 ? Math.round(symbolsCount / 1800) : 300,
      };
    });

  return new Response(JSON.stringify(books), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
