import VerdictBadge, { VERDICT_CONFIG } from './VerdictBadge'
import ConfidenceMeter from './ConfidenceMeter'
import SourcesList from './SourcesList'

function ResultCard({ result, onReset }) {
  const config = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIED

  return (
    <div className={`result-card ${config.bg}`}>
      {/* Header */}
      <div className="result-header">
        <VerdictBadge verdict={result.verdict} size="large" />
        <button className="reset-btn" onClick={onReset}>
          ← Check Another
        </button>
      </div>

      {/* Claim */}
      <div className="result-section">
        <h3 className="section-label">📌 Extracted Claim</h3>
        <p className="claim-text">"{result.extractedClaim}"</p>
      </div>

      {/* Confidence */}
      <div className="result-section">
        <h3 className="section-label">📊 Confidence Score</h3>
        <ConfidenceMeter score={result.confidenceScore} verdict={result.verdict} />
      </div>

      {/* Explanation */}
      <div className="result-section">
        <h3 className="section-label">📋 AI Explanation</h3>
        <p className="explanation-text">{result.explanation}</p>
      </div>

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="result-section">
          <h3 className="section-label">🔗 Sources</h3>
          <SourcesList sources={result.sources} />
        </div>
      )}

      <div className="result-footer">
        <span className="input-type-tag">
          {result.inputType === 'image' ? '🖼️ Image' : '📝 Text'} Analysis
        </span>
        <span className="timestamp">
          {new Date(result.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default ResultCard
