interface Props {
  onClick(): void
  spinning: boolean
}

export default function RefreshButton({ onClick, spinning }: Props) {
  return (
    <button className="refresh-btn" onClick={onClick} disabled={spinning} aria-label="Refresh">
      <i className={`ti ti-refresh${spinning ? ' spin' : ''}`} aria-hidden="true" />
    </button>
  )
}
