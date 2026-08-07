'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowUpRight, ChevronRight, CircleDot, Clock3, Coins, ExternalLink, LoaderCircle, LockKeyhole, Radio, RefreshCw, Search, Shield, Sparkles, Swords, X } from 'lucide-react'

type MarketRef = { id: string; urlName: string }
type Reward = { rarity: string; chance: number; item: { name: string; warframeMarket?: MarketRef } }
type RelicRaw = { name: string; type: string; imageName?: string; vaulted?: boolean; rewards?: Reward[]; marketInfo?: MarketRef }
type Relic = RelicRaw & { baseName: string; era: string; refinement: string }
type Order = { id: string; platinum: number; quantity: number; user: { ingameName: string; status: string; reputation: number } }
type Quote = { sell: Order[]; buy: Order[]; loading?: boolean; error?: boolean }
type WorldState = {
  timestamp: string
  cetusCycle?: { state: string; expiry: string; timeLeft: string }
  vallisCycle?: { state: string; expiry: string; timeLeft: string }
  cambionCycle?: { active: string; expiry: string; timeLeft: string }
  voidTrader?: { active: boolean; character: string; location: string; startString: string; endString: string }
  arbitration?: { node: string; type: string; enemy: string; expiry: string }
  sortie?: { boss: string; faction: string; variants: { missionType: string; node: string; modifier: string }[] }
  fissures?: { id: string; node: string; missionType: string; enemy: string; tier: string; isStorm?: boolean; eta: string }[]
}

const STATUS_API = '/api'
const MARKET_API = '/api/market'
const REFINEMENTS = ['Intact', 'Exceptional', 'Flawless', 'Radiant']
const ERAS = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem']

function countdown(date?: string) {
  if (!date) return '—'
  const d = Math.max(0, new Date(date).getTime() - Date.now())
  const h = Math.floor(d / 3_600_000)
  const m = Math.floor((d % 3_600_000) / 60_000)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export function Dashboard() {
  const [relics, setRelics] = useState<Relic[]>([])
  const [world, setWorld] = useState<WorldState | null>(null)
  const [query, setQuery] = useState('')
  const [era, setEra] = useState('All')
  const [vault, setVault] = useState<'all' | 'open' | 'vaulted'>('all')
  const [selected, setSelected] = useState<Relic | null>(null)
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [loadingRelics, setLoadingRelics] = useState(true)
  const [relicError, setRelicError] = useState(false)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`${STATUS_API}/relics`).then(r => { if (!r.ok) throw new Error('items'); return r.json() }).then((items: RelicRaw[]) => {
      if (!alive) return
      const normalized = items as Relic[]
      setRelics(normalized)
      setSelected(normalized.find(r => r.baseName === 'Axi A1' && r.refinement === 'Intact') || normalized[0] || null)
      setLoadingRelics(false)
    }).catch(() => { if (alive) { setLoadingRelics(false); setRelicError(true) } })
    return () => { alive = false }
  }, [])

  // World state is server-cached with a 60s revalidate window (app/api/world/route.ts),
  // so polling on the same cadence keeps this live without exceeding upstream limits.
  useEffect(() => {
    let alive = true
    const load = () => fetch(`${STATUS_API}/world`).then(r => { if (!r.ok) throw new Error('world'); return r.json() })
      .then((state: WorldState) => { if (alive) setWorld(state) }).catch(() => {})
    load()
    const timer = window.setInterval(load, 60_000)
    return () => { alive = false; window.clearInterval(timer) }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  // Market quotes share the same 60s server-side cache (app/api/market/[slug]/route.ts).
  // warframe.market's public API limit is 3 req/s; refetching per-slug at most once per
  // 60s keeps this dashboard far under that even with multiple tabs open.
  useEffect(() => {
    if (!selected?.rewards) return
    let alive = true
    const slugs = [...new Set(selected.rewards.map(r => r.item.warframeMarket?.urlName).filter(Boolean))] as string[]
    if (!slugs.length) return
    const load = () => slugs.forEach(async slug => {
      try {
        const res = await fetch(`${MARKET_API}/${slug}`)
        if (!res.ok) throw new Error('quote')
        const json = await res.json()
        if (alive) setQuotes(old => ({ ...old, [slug]: json.data }))
      } catch {
        if (alive) setQuotes(old => ({ ...old, [slug]: { sell: [], buy: [], error: true } }))
      }
    })
    load()
    const timer = window.setInterval(load, 60_000)
    return () => { alive = false; window.clearInterval(timer) }
  }, [selected])

  const catalog = useMemo(() => {
    const map = new Map<string, Relic>()
    relics.filter(r => r.refinement === 'Intact').forEach(r => map.set(r.baseName, r))
    return [...map.values()].filter(r => {
      const matchesSearch = r.baseName.toLowerCase().includes(query.toLowerCase()) || r.rewards?.some(x => x.item.name.toLowerCase().includes(query.toLowerCase()))
      return matchesSearch && (era === 'All' || r.era === era) && (vault === 'all' || (vault === 'vaulted') === Boolean(r.vaulted))
    }).sort((a, b) => ERAS.indexOf(a.era) - ERAS.indexOf(b.era) || a.baseName.localeCompare(b.baseName))
  }, [relics, query, era, vault])

  const selectedRefinements = selected ? REFINEMENTS.map(name => relics.find(r => r.baseName === selected.baseName && r.refinement === name)).filter(Boolean) as Relic[] : []
  const rewardRows = selected?.rewards?.map(reward => {
    const slug = reward.item.warframeMarket?.urlName
    const quote = slug ? quotes[slug] : undefined
    return { reward, slug, quote, sell: quote?.sell?.[0]?.platinum, buy: quote?.buy?.[0]?.platinum }
  }) || []
  const pricesLoading = rewardRows.some(row => row.slug && !row.quote)
  const expected = rewardRows.reduce((sum, row) => sum + (row.sell || 0) * row.reward.chance / 100, 0)
  const activeFissures = world?.fissures?.filter(f => !f.isStorm).slice(0, 5) || []

  return <div className="app-shell">
    <div className="grain" />
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Relic Signal home"><span className="brand-mark"><Radio size={18}/></span><span>RELIC<span>SIGNAL</span></span></a>
      <nav><a href="#catalog">Relics</a><a href="#world">World state</a><a href="https://warframe.market" target="_blank" rel="noopener noreferrer">Market <ExternalLink size={12}/></a></nav>
      <div className="live-chip"><i /> LIVE · PC CROSSPLAY</div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="eyebrow"><span>OROKIN INTELLIGENCE NETWORK</span><span className="line" /></div>
        <h1>CRACK RELICS.<br/><em>READ THE MARKET.</em></h1>
        <p>Live platinum signals, reward probabilities, and Origin System conditions—built for Tenno who value their time.</p>
        <div className="hero-stats">
          <div><strong>{relics.length ? new Set(relics.map(r => r.baseName)).size : '—'}</strong><span>RELICS INDEXED</span></div>
          <div><strong>{world?.fissures?.length ?? '—'}</strong><span>ACTIVE FISSURES</span></div>
          <div><strong>V2</strong><span>MARKET FEED</span></div>
        </div>
        <CircleDot className="orbit-dot" size={18}/>
      </section>

      <section className="world-strip" id="world">
        <div className="section-tag"><Activity size={15}/><span>WORLD STATE</span></div>
        <div className="world-grid">
          <WorldCard icon={<Sparkles/>} label="CETUS" state={world?.cetusCycle?.state || 'SYNCING'} time={countdown(world?.cetusCycle?.expiry)} tone="sun" />
          <WorldCard icon={<Shield/>} label="CAMBION DRIFT" state={world?.cambionCycle?.active || 'SYNCING'} time={countdown(world?.cambionCycle?.expiry)} tone="red" />
          <WorldCard icon={<Swords/>} label="ARBITRATION" state={world?.arbitration?.type || 'OFFLINE'} time={world?.arbitration?.node || 'Awaiting signal'} tone="blue" />
          <WorldCard icon={<Coins/>} label="VOID TRADER" state={world?.voidTrader?.active ? 'ACTIVE' : 'IN TRANSIT'} time={world?.voidTrader?.active ? world.voidTrader.location : world?.voidTrader?.startString || '—'} tone="gold" />
        </div>
        {activeFissures.length > 0 && <div className="fissure-ticker"><span><Radio size={13}/> VOID FISSURES</span><div>{activeFissures.map(f => <b key={f.id}><i className={`era ${f.tier.toLowerCase()}`}>{f.tier[0]}</i>{f.node} · {f.missionType}<small>{f.eta}</small></b>)}</div></div>}
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading"><div><span className="index">01</span><h2>RELIC ARCHIVE</h2></div><p>Choose a relic to calculate its live expected platinum return.</p></div>
        <div className="workbench">
          <aside className="filters">
            <label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search relic or reward..." />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label>
            <div className="filter-block"><span>ERA</span><div className="segmented">{['All', ...ERAS].map(v => <button className={era === v ? 'active' : ''} onClick={() => setEra(v)} key={v}>{v}</button>)}</div></div>
            <div className="filter-block"><span>STATUS</span><div className="status-filters"><button className={vault === 'all' ? 'active' : ''} onClick={() => setVault('all')}>All</button><button className={vault === 'open' ? 'active' : ''} onClick={() => setVault('open')}>Available</button><button className={vault === 'vaulted' ? 'active' : ''} onClick={() => setVault('vaulted')}>Vaulted</button></div></div>
            <div className="result-count"><b>{catalog.length}</b> matching relics</div>
            <div className="relic-list">
              {loadingRelics && <div className="loading"><LoaderCircle className="spin"/> Decoding archive</div>}
              {relicError && <div className="loading error">Signal lost. Refresh to retry.</div>}
              {catalog.slice(0, 180).map(relic => <button key={relic.baseName} className={selected?.baseName === relic.baseName ? 'selected' : ''} onClick={() => setSelected(relic)}><i className={`era ${relic.era.toLowerCase()}`}>{relic.era[0]}</i><span><b>{relic.baseName}</b><small>{relic.vaulted ? 'VAULTED' : 'AVAILABLE'}</small></span>{relic.vaulted && <LockKeyhole size={12}/>}<ChevronRight size={15}/></button>)}
            </div>
          </aside>

          <div className="relic-detail">
            {!selected ? <div className="empty-state"><Radio size={34}/><h3>AWAITING SIGNAL</h3><p>Select a relic from the archive.</p></div> : <>
              <div className="detail-head">
                <div className={`relic-emblem ${selected.era.toLowerCase()}`}><span>{selected.era[0]}</span><i /></div>
                <div><span className="relic-meta">{selected.era} ERA / {selected.vaulted ? 'VAULTED' : 'ACTIVE ROTATION'}</span><h3>{selected.baseName}</h3><div className="refinements">{selectedRefinements.map(r => <button key={r.refinement} className={selected.refinement === r.refinement ? 'active' : ''} onClick={() => setSelected(r)}>{r.refinement}</button>)}</div></div>
                <div className="ev-card"><span>EXPECTED VALUE</span><strong>{pricesLoading ? <LoaderCircle className="spin"/> : `${expected.toFixed(1)}p`}</strong><small>per relic · current sell floor</small></div>
              </div>
              <div className="reward-table">
                <div className="reward-header"><span>REWARD</span><span>RARITY / CHANCE</span><span>TOP BUY</span><span>LOWEST SELL</span><span /></div>
                {rewardRows.sort((a,b) => (b.sell || 0) - (a.sell || 0)).map(({reward, slug, quote, sell, buy}) => <div className="reward-row" key={reward.item.name}>
                  <div><i className={`rarity-dot ${reward.rarity.toLowerCase()}`} /><span><b>{reward.item.name}</b><small>{slug ? 'TRADEABLE' : 'NO MARKET LISTING'}</small></span></div>
                  <div><span className={`rarity-label ${reward.rarity.toLowerCase()}`}>{reward.rarity}</span><b>{reward.chance.toFixed(2)}%</b></div>
                  <div className="price">{quote?.loading ? <LoaderCircle className="spin"/> : buy ? <>{buy}<small>p</small></> : '—'}</div>
                  <div className="price sell">{quote?.loading ? <LoaderCircle className="spin"/> : sell ? <>{sell}<small>p</small></> : '—'}</div>
                  <div>{slug && <a aria-label={`Open ${reward.item.name} on Warframe Market`} href={`https://warframe.market/items/${slug}`} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16}/></a>}</div>
                </div>)}
              </div>
              <div className="detail-foot"><span><RefreshCw size={13}/> Quotes load live from online PC crossplay orders</span><span>{now ? `Updated ${new Date(now).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : 'Live data'}</span></div>
            </>}
          </div>
        </div>
      </section>
    </main>
    <footer><div className="brand mini"><span className="brand-mark"><Radio size={14}/></span><span>RELIC<span>SIGNAL</span></span></div><p>Open source under MIT. Not affiliated with Digital Extremes.</p><div><a href="https://github.com/Mersal108/relic-signal" target="_blank" rel="noopener noreferrer">SOURCE</a><a href="https://docs.warframe.market/docs/intro" target="_blank" rel="noopener noreferrer">MARKET API</a><a href="https://github.com/wfcd/warframe-status" target="_blank" rel="noopener noreferrer">WFCD</a></div></footer>
  </div>
}

function WorldCard({ icon, label, state, time, tone }: { icon: React.ReactNode; label: string; state: string; time: string; tone: string }) {
  return <article className={`world-card ${tone}`}><div className="world-icon">{icon}</div><div><span>{label}</span><strong>{state.toUpperCase()}</strong></div><div className="world-time"><Clock3 size={12}/>{time}</div></article>
}
