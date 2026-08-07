import Items from 'warframe-items'

const refinements = ['Intact', 'Exceptional', 'Flawless', 'Radiant']
const relicItems = new Items({ category: ['Relics'], i18n: false })

export async function GET() {
  try {
    const relics = relicItems
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
