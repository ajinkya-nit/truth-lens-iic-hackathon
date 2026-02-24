import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistory } from '../services/api'
import VerdictBadge from './VerdictBadge'

function TrendingFeed() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then((res) => setRecords(res.data.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="trending-loading">Loading feed…</div>
  if (!records.length) return <div className="trending-empty">No fact-checks yet. Be the first!</div>

  return (
    <div className="trending-feed">
      <h2 className="feed-title">📈 Trending Fact-Checks</h2>
      <ul className="feed-list">
        {records.map((r) => (
          <li key={r._id} className="feed-item">
            <Link to={`/history/${r._id}`} className="feed-link">
              <div className="feed-item-meta">
                <VerdictBadge verdict={r.verdict} size="small" />
                <span className="feed-type">{r.inputType === 'image' ? '🖼️' : '📝'}</span>
              </div>
              <p className="feed-claim">{r.extractedClaim}</p>
              <span className="feed-time">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TrendingFeed
