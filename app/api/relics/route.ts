const RELIC_DATA = 'https://unpkg.com/warframe-items@latest/data/json/Relics.json'
const refinements = ['Intact', 'Exceptional', 'Flawless', 'Radiant']

export async function GET() {
  try {
    const upstream = await fetch(RELIC_DATA, { next: { revalidate: 21600 } })
    if (!upstream.ok) throw new Error('Upstream rejected request')
    const items = await upstream.json()
    const relics = items
      .filter((item: { name?: string }) => refinements.some(value => item.name?.endsWith(value)))
      .map((item: { name: string; vaulted?: boolean; rewards?: unknown[] }) => {
        const refinement = refinements.find(value => item.name.endsWith(value))!
        const baseName = item.name.slice(0, -(refinement.length + 1))
        return { name: item.name, vaulted: item.vaulted, rewards: item.rewards, refinement, baseName, era: baseName.split(' ')[0] }
      })
    return Response.json(relics, { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' } })
  } catch {
    return Response.json({ error: 'Relic service unavailable' }, { status: 502 })
  }
}
