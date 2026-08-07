import Items from 'warframe-items'

const refinements = ['Intact', 'Exceptional', 'Flawless', 'Radiant']
const relicItems = new Items({ category: ['Relics'], i18n: false })

type RelicReward = {
  rarity: string
  chance: number
  item: { name: string; warframeMarket?: { id: string; urlName: string } }
}
type RelicItem = { name: string; vaulted?: boolean; rewards?: RelicReward[] }

export async function GET() {
  try {
    const relics = (relicItems as unknown as RelicItem[])
      .filter((item: { name?: string }) => refinements.some(value => item.name?.endsWith(value)))
      .map((item) => {
        const refinement = refinements.find(value => item.name.endsWith(value))!
        const baseName = item.name.slice(0, -(refinement.length + 1))
        const rewards = item.rewards?.map(reward => ({
          rarity: reward.rarity,
          chance: reward.chance,
          item: { name: reward.item.name, warframeMarket: reward.item.warframeMarket },
        }))
        return { name: item.name, vaulted: item.vaulted, rewards, refinement, baseName, era: baseName.split(' ')[0] }
      })
    return Response.json(relics, { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' } })
  } catch {
    return Response.json({ error: 'Relic service unavailable' }, { status: 502 })
  }
}
