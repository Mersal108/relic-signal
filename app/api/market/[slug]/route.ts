const MARKET_API = 'https://api.warframe.market/v2'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[a-z0-9_]+$/.test(slug)) return Response.json({ error: 'Invalid item slug' }, { status: 400 })

  try {
    const upstream = await fetch(`${MARKET_API}/orders/item/${slug}/top`, {
      headers: { Language: 'en', Platform: 'pc', Crossplay: 'true', 'User-Agent': 'RelicSignal/1.0 (open-source Warframe dashboard)' },
      next: { revalidate: 60 },
    })
    if (!upstream.ok) return Response.json({ error: 'Market service unavailable' }, { status: upstream.status })
    return Response.json(await upstream.json(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch {
    return Response.json({ error: 'Market service unavailable' }, { status: 502 })
  }
}
