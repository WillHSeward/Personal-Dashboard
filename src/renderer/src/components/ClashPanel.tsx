import PanelShell from './PanelShell'
import type { ClashData } from '../../../shared/types'

export default function ClashPanel({ clash }: { clash: ClashData | null }) {
  if (!clash) {
    return (
      <PanelShell title="Clash Royale" icon="ti-cards" iconColor="var(--accent-gold)" delay={0.24}>
        <div style={{ color: 'var(--faint)', fontSize: 13 }}>Set CR_API_KEY and CR_PLAYER_TAG in .env</div>
      </PanelShell>
    )
  }

  const seasonalTrophies = clash.seasonalTrophies ?? clash.trophies

  return (
    <PanelShell title={clash.name} icon="ti-cards" iconColor="var(--accent-gold)" delay={0.24}>
      <div className="trophy">
        <span className="num">{clash.league}</span>
      </div>
      <div className="rankline">
        {clash.globalRank != null && <>Global #{clash.globalRank.toLocaleString()} · </>}
        {clash.seasonalArena ? (
          <>
            {clash.seasonalArena} · {seasonalTrophies.toLocaleString()}
            <i className="ti ti-trophy rank-trophy" aria-hidden="true" /> · {clash.winRate}% WR
          </>
        ) : (
          <>{clash.trophies.toLocaleString()} trophies · {clash.winRate}% WR</>
        )}
      </div>
      <div className="deckcaption">Current deck</div>
      <div className="chips">
        {clash.currentDeck.map((card) => (
          <span key={card} className="chip">{card}</span>
        ))}
      </div>
    </PanelShell>
  )
}
