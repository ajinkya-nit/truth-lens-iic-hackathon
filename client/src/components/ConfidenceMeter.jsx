const COLOR_MAP = {
  REAL: '#22c55e',
  FAKE: '#ef4444',
  MISLEADING: '#f59e0b',
  UNVERIFIED: '#94a3b8',
}

function ConfidenceMeter({ score, verdict }) {
  const color = COLOR_MAP[verdict] || COLOR_MAP.UNVERIFIED

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
