import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getHistory, deleteRecord } from '../services/api'
import VerdictBadge from '../components/VerdictBadge'
import ConfidenceMeter from '../components/ConfidenceMeter'

function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const fetchHistory = () => {
    setLoading(true)
    getHistory()
      .then((res) => setRecords(res.data.data || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchHistory() }, [])

  const handleDelete = async (id, e) => {
    e.preventDefault()
    if (!window.confirm('Delete this record?')) return
    try {
      await deleteRecord(id)
      setRecords((prev) => prev.filter((r) => r._id !== id))
      toast.success('Record deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const verdicts = ['ALL', 'REAL', 'FAKE', 'MISLEADING', 'UNVERIFIED']
  const filtered = filter === 'ALL' ? records : records.filter((r) => r.verdict === filter)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📂 Fact-Check History</h1>
        <p className="page-sub">All past verifications stored in MongoDB</p>
      </div>

      {/* Filters */}
      <div className="filter-row">
        {verdicts.map((v) => (
          <button
            key={v}
            className={`filter-btn ${filter === v ? 'active' : ''} filter-${v.toLowerCase()}`}
            onClick={() => setFilter(v)}
          >
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="global-loader">
          <div className="loader-orb-container">
            <div className="loader-orb" />
            <div className="loader-ring-outer" />
          </div>
          <div className="loader-dots">
            <span className="loader-dot" />
            <span className="loader-dot" />
            <span className="loader-dot" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>🔍</span>
          <p>No records found. Run a verification first!</p>
          <Link to="/" className="verify-btn" style={{display:'inline-block',marginTop:'1rem'}}>Go Verify</Link>
        </div>
      ) : (
        <div className="history-grid">
          {filtered.map((r) => (
            <Link to={`/history/${r._id}`} key={r._id} className="history-card">
              <div className="hcard-header">
                <VerdictBadge verdict={r.verdict} size="small" />
                <span className="feed-type">{r.inputType === 'image' ? '🖼️' : '📝'}</span>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDelete(r._id, e)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
              <p className="hcard-claim">"{r.extractedClaim}"</p>
              <ConfidenceMeter score={r.confidenceScore} verdict={r.verdict} />
              <span className="hcard-time">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
