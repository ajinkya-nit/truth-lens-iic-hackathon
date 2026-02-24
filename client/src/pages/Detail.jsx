import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDetail, deleteRecord } from '../services/api'
import VerdictBadge from '../components/VerdictBadge'
import ConfidenceMeter from '../components/ConfidenceMeter'
import SourcesList from '../components/SourcesList'
import toast from 'react-hot-toast'

function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDetail(id)
      .then((res) => setRecord(res.data.data))
      .catch(() => toast.error('Record not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this record?')) return
    try {
      await deleteRecord(id)
      toast.success('Deleted')
      navigate('/history')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return (
    <div className="global-loader"><div className="loader-ring" /></div>
  )

  if (!record) return (
    <div className="empty-state">
      <p>Record not found.</p>
      <Link to="/history">← Back</Link>
    </div>
  )

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="detail-back">
        <Link to="/history" className="back-link">← Back to History</Link>
        <button className="delete-btn-lg" onClick={handleDelete}>🗑️ Delete</button>
      </div>

      <div className="detail-card">
        <div className="result-header">
          <VerdictBadge verdict={record.verdict} size="large" />
          <span className="input-type-tag">
            {record.inputType === 'image' ? '🖼️ Image' : '📝 Text'}
          </span>
        </div>

        <div className="result-section">
          <h3 className="section-label">📌 Extracted Claim</h3>
          <p className="claim-text">"{record.extractedClaim}"</p>
        </div>

        <div className="result-section">
          <h3 className="section-label">📊 Confidence Score</h3>
          <ConfidenceMeter score={record.confidenceScore} verdict={record.verdict} />
        </div>

        <div className="result-section">
          <h3 className="section-label">📋 AI Explanation</h3>
          <p className="explanation-text">{record.explanation}</p>
        </div>

        {record.sources && record.sources.length > 0 && (
          <div className="result-section">
            <h3 className="section-label">🔗 Sources</h3>
            <SourcesList sources={record.sources} />
          </div>
        )}

        <div className="result-section">
          <h3 className="section-label">📥 Original Input</h3>
          <p className="original-input-text">{record.originalInput}</p>
        </div>

        <div className="result-footer">
          <span className="timestamp">Verified on {new Date(record.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default Detail
