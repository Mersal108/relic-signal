export async function GET() {
  try {
    const upstream = await fetch('https://api.warframestat.us/pc', { next: { revalidate: 60 } })
    if (!upstream.ok) throw new Error('Upstream rejected request')
    return Response.json(await upstream.json(), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch {
    return Response.json({ error: 'World-state service unavailable' }, { status: 502 })
  }
}
