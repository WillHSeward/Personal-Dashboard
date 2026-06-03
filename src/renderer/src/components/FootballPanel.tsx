import { useState } from 'react'
import PanelShell from './PanelShell'
import RefreshButton from './RefreshButton'
import type { FootballData } from '../../../shared/types'

interface Props {
  football: FootballData
  onRefresh(): void
  refreshing: boolean
}

function kickoff(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', hour: 'numeric', minute: '2-digit',
  })
}

const MyStar = () => <i className="ti ti-star-filled myteam-star" aria-label="your team" />

export default function FootballPanel({ football, onRefresh, refreshing }: Props) {
  const [showAllFixtures, setShowAllFixtures] = useState(false)

  const { table, fixtures } = football
  const refreshBtn = <RefreshButton onClick={onRefresh} spinning={refreshing} />

  if (table.length === 0) {
    return (
      <PanelShell title="Premier League" icon="ti-ball-football" iconColor="var(--accent-green)" delay={0.18} headerAction={refreshBtn}>
        <div style={{ color: 'var(--faint)', fontSize: 13 }}>Set FOOTBALL_API_KEY in .env</div>
      </PanelShell>
    )
  }

  const visibleFixtures = showAllFixtures ? fixtures : fixtures.slice(0, 1)

  return (
    <PanelShell title="Premier League" icon="ti-ball-football" iconColor="var(--accent-green)" delay={0.18} headerAction={refreshBtn}>
      <div className="tbl">
        <div className="trow thead">
          <span className="pos">#</span>
          <span className="club">Club</span>
          <span className="p">P</span>
          <span className="w">W</span>
          <span className="l">L</span>
          <span className="gd">GD</span>
          <span className="pts">Pts</span>
        </div>
        {table.map((row) => {
          // Position zones: 1–5 Champions League, 6 Europa, 18–20 relegation
          const zone = row.pos <= 5 ? 'top4' : row.pos === 6 ? 'europa' : row.pos >= 18 ? 'releg' : ''
          return (
            <div key={row.pos} className="trow" style={{ opacity: zone ? 1 : 0.7 }}>
              <span className={`pos${zone ? ` ${zone}` : ''}`}>{row.pos}</span>
              <span className="club">
                {row.crest && <img className="club-badge" src={row.crest} alt="" />}
                <span className="club-name">{row.club}</span>
                {row.isMyTeam && <MyStar />}
              </span>
              <span className="p">{row.p}</span>
              <span className="w">{row.won}</span>
              <span className="l">{row.lost}</span>
              <span className="gd">{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
              <span className="pts">{row.pts}</span>
            </div>
          )
        })}
      </div>

      {fixtures.length > 0 && (
        <div className="fixtures">
          <div className="fixtures-cap">{showAllFixtures ? 'This week' : 'Next match'}</div>
          {visibleFixtures.map((fx) => (
            <div key={fx.id} className="fixture">
              <span className="fx-teams">
                {fx.home} <span className="fx-v">v</span> {fx.away}
                {fx.involvesMyTeam && <MyStar />}
              </span>
              <span className="fx-time">{kickoff(fx.utcDate)}</span>
            </div>
          ))}
          {fixtures.length > 1 && (
            <button className="link-btn" onClick={() => setShowAllFixtures((v) => !v)}>
              {showAllFixtures ? 'Show less' : `Show all ${fixtures.length} this week`}
            </button>
          )}
        </div>
      )}
    </PanelShell>
  )
}
