const COLOR_MAP = {
  REAL: '#22c55e',
  FAKE: '#ef4444',
  MISLEADING: '#f59e0b',
  UNVERIFIED: '#94a3b8',
}

function ConfidenceMeter({ score, verdict }) {
  const color = COLOR_MAP[verdict] || COLOR_MAP.UNVERIFIED
  const isUnverified = verdict === 'UNVERIFIED' || score === 0

  if (isUnverified) {
    return (
      <div className="confidence-meter">
        <div className="meter-bar-bg">
          <div
            className="meter-bar-fill meter-bar-striped"
            style={{ width: '100%', backgroundColor: 'rgba(148,163,184,0.15)' }}
          />
        </div>
        <span className="meter-score meter-na">N/A</span>
      </div>
    )
  }

  return (
    <div className="confidence-meter">
      <div className="meter-bar-bg">
        <div
          className="meter-bar-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="meter-score" style={{ color }}>
        {score}%
      </span>
    </div>
  )
}

export default ConfidenceMeter
