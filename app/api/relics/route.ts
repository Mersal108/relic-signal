const STATUS_API = 'https://api.warframestat.us'
const refinements = ['Intact', 'Exceptional', 'Flawless', 'Radiant']

export async function GET() {
  try {
    const upstream = await fetch(`${STATUS_API}/items`, { next: { revalidate: 21600 } })
    if (!upstream.ok) throw new Error('Upstream rejected request')
    const items = await upstream.json()
    const relics = items
      .filter((item: { type?: string; name?: string }) => item.type === 'Relic' && refinements.some(value => item.name?.endsWith(value)))
      .map((item: { name: string; [key: string]: unknown }) => {
        const refinement = refinements.find(value => item.name.endsWith(value))!
        const baseName = item.name.slice(0, -(refinement.length + 1))
        return { ...item, refinement, baseName, era: baseName.split(' ')[0] }
      })
    return Response.json(relics, { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' } })
  } catch {
    return Response.json({ error: 'Relic service unavailable' }, { status: 502 })
  }
}
