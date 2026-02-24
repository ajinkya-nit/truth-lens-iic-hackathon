const VERDICT_CONFIG = {
  REAL: {
    label: 'REAL',
    emoji: '✅',
    className: 'badge-real',
    bg: 'card-real',
  },
  FAKE: {
    label: 'FAKE',
    emoji: '❌',
    className: 'badge-fake',
    bg: 'card-fake',
  },
  MISLEADING: {
    label: 'MISLEADING',
    emoji: '⚠️',
    className: 'badge-misleading',
    bg: 'card-misleading',
  },
  UNVERIFIED: {
    label: 'UNVERIFIED',
    emoji: '❓',
    className: 'badge-unverified',
    bg: 'card-unverified',
  },
}

function VerdictBadge({ verdict, size = 'large' }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.UNVERIFIED
  return (
    <span className={`verdict-badge ${config.className} badge-${size}`}>
      {config.emoji} {config.label}
    </span>
  )
}

export { VERDICT_CONFIG }
export default VerdictBadge
