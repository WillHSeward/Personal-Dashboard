import { useState } from 'react'
import PanelShell from './PanelShell'
import RefreshButton from './RefreshButton'
import type { WorldCupData, WCFixture } from '../../../shared/types'

interface Props {
  wc: WorldCupData | null
  onRefresh(): void
  refreshing: boolean
}

const COLLAPSED_FIXTURES = 5

const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: 'Group stage',
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-final',
  SEMI_FINALS: 'Semi-final',
  THIRD_PLACE: 'Third place',
  FINAL: 'Final',
}

// Knockout stages in the order the bracket should read.
const BRACKET_STAGES = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']

function kickoff(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

// Group label for group games, otherwise the knockout stage name.
function fixtureTag(fx: WCFixture): string {
  return fx.group ?? STAGE_LABEL[fx.stage] ?? fx.stage
}

export default function WorldCupPanel({ wc, onRefresh, refreshing }: Props) {
  const [showGroups, setShowGroups] = useState(false)
  const [showBracket, setShowBracket] = useState(false)
  const [showScorers, setShowScorers] = useState(false)
  const [showAllFixtures, setShowAllFixtures] = useState(false)

  const refreshBtn = <RefreshButton onClick={onRefresh} spinning={refreshing} />

  if (!wc) {
    return (
      <PanelShell title="World Cup" icon="ti-trophy" iconColor="var(--accent-gold)" delay={0.30} headerAction={refreshBtn}>
        <div style={{ color: 'var(--faint)', fontSize: 13 }}>Set FOOTBALL_API_KEY in .env</div>
      </PanelShell>
    )
  }

  const upcoming = wc.fixtures.filter((f) => f.status === 'SCHEDULED' || f.status === 'TIMED')
  const visibleFixtures = showAllFixtures ? upcoming : upcoming.slice(0, COLLAPSED_FIXTURES)

  return (
    <PanelShell title="World Cup" icon="ti-trophy" iconColor="var(--accent-gold)" delay={0.30} headerAction={refreshBtn}>
      {upcoming.length === 0 ? (
        <div style={{ color: 'var(--faint)', fontSize: 13 }}>No upcoming matches scheduled</div>
      ) : (
        <>
          <div className="fixtures-cap">Upcoming</div>
          {visibleFixtures.map((fx) => (
            <div key={fx.id} className="fixture">
              <span className="fx-teams">
                {fx.home} <span className="fx-v">v</span> {fx.away}
                <span className="fx-grp">{fixtureTag(fx)}</span>
              </span>
              <span className="fx-time">{kickoff(fx.utcDate)}</span>
            </div>
          ))}
          {upcoming.length > COLLAPSED_FIXTURES && (
            <button className="link-btn" onClick={() => setShowAllFixtures((v) => !v)}>
              {showAllFixtures ? 'Show less' : 'Show all upcoming'}
            </button>
          )}
        </>
      )}

      {wc.groups.length > 0 && (
        <div className="wc-section">
          <button className="link-btn" onClick={() => setShowGroups((v) => !v)}>
            {showGroups ? 'Hide groups' : 'Groups'}
          </button>
          {showGroups && (
            <div className="wc-groups">
              <div className="wc-ghead">
                <span className="wc-pos">#</span>
                <span className="wc-team">Team</span>
                <span>P</span>
                <span>W</span>
                <span>D</span>
                <span>L</span>
                <span>GD</span>
                <span className="wc-pts">Pts</span>
              </div>
              {wc.groups.map((g) => (
                <div key={g.name} className="wc-group">
                  <div className="wc-group-name">{g.name}</div>
                  {g.rows.map((r) => (
                    <div key={r.team} className="wc-grow" style={{ opacity: r.pos <= 2 ? 1 : 0.6 }}>
                      <span className="wc-pos">{r.pos}</span>
                      <span className="wc-team">
                        {r.crest && <img className="wc-flag" src={r.crest} alt="" />}
                        <span className="wc-team-name">{r.team}</span>
                      </span>
                      <span className="wc-p">{r.played}</span>
                      <span className="wc-w">{r.won}</span>
                      <span className="wc-d">{r.draw}</span>
                      <span className="wc-l">{r.lost}</span>
                      <span className="wc-gd">{r.gd > 0 ? `+${r.gd}` : r.gd}</span>
                      <span className="wc-pts">{r.pts}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {wc.knockout.length > 0 && (
        <div className="wc-section">
          <button className="link-btn" onClick={() => setShowBracket((v) => !v)}>
            {showBracket ? 'Hide bracket' : 'Show bracket'}
          </button>
          {showBracket && (
            <div className="wc-bracket">
              {BRACKET_STAGES.map((stage) => {
                const matches = wc.knockout.filter((k) => k.stage === stage)
                if (matches.length === 0) return null
                return (
                  <div key={stage} className="wc-br-stage">
                    <div className="wc-br-stage-name">{STAGE_LABEL[stage]}</div>
                    {matches.map((m) => (
                      <div key={m.id} className="wc-br-match">
                        <span className="wc-br-teams">{m.home} <span className="fx-v">v</span> {m.away}</span>
                        <span className="wc-br-meta">
                          {m.homeScore != null && m.awayScore != null
                            ? `${m.homeScore}–${m.awayScore}`
                            : new Date(m.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {wc.scorers.length > 0 && (
        <div className="wc-section">
          <button className="link-btn" onClick={() => setShowScorers((v) => !v)}>
            {showScorers ? 'Hide top scorers' : 'Top scorers'}
          </button>
          {showScorers && (
            <div className="wc-scorers">
              {wc.scorers.map((s) => (
                <div key={s.name} className="wc-scorer">
                  <span className="wc-scorer-name">{s.name}</span>
                  <span className="wc-scorer-team">{s.team}</span>
                  <span className="wc-scorer-goals">{s.goals}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PanelShell>
  )
}
