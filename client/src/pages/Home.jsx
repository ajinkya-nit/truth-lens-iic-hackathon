import { useState } from 'react'
import toast from 'react-hot-toast'
import UploadZone from '../components/UploadZone'
import ResultCard from '../components/ResultCard'
import TrendingFeed from '../components/TrendingFeed'
import { verifyText, verifyImage } from '../services/api'

function Home() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTextSubmit = async (text) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await verifyText(text)
      setResult(res.data.data)
      toast.success('Verification complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSubmit = async (file) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await verifyImage(file)
      setResult(res.data.data)
      toast.success('Verification complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => setResult(null)

  return (
    <div className="home-layout">
      {/* Left / Main column */}
      <section className="main-column">
        <div className="hero">
          <h1 className="hero-title">
            Combat Misinformation.<br />
            <span className="hero-highlight">Instantly.</span>
          </h1>
          <p className="hero-sub">
            Paste any suspicious text or drop an image/screenshot. TruthLens
            uses Gemini AI and real-time web search to deliver a verdict in
            seconds — backed by real sources.
          </p>
        </div>

        {loading && (
          <div className="global-loader">
            <div className="loader-ring" />
            <p>Scanning the web &amp; analysing with AI…</p>
          </div>
        )}

        {!result && !loading && (
          <UploadZone
            onTextSubmit={handleTextSubmit}
            onImageSubmit={handleImageSubmit}
            loading={loading}
          />
        )}

        {result && !loading && (
          <ResultCard result={result} onReset={handleReset} />
        )}

        {/* How it works */}
        {!result && !loading && (
          <div className="how-it-works">
            <h2>How it works</h2>
            <div className="steps-grid">
              {[
                { step: '1', icon: '📥', label: 'Upload', desc: 'Paste text or drop an image' },
                { step: '2', icon: '🤖', label: 'AI Extracts Claim', desc: 'Gemini understands & summarises the core claim' },
                { step: '3', icon: '🔎', label: 'Web Search', desc: 'Tavily scours fact-check sites in real time' },
                { step: '4', icon: '⚖️', label: 'Verdict', desc: 'AI compares claim vs evidence & returns a verdict' },
              ].map((s) => (
                <div key={s.step} className="step-card">
                  <span className="step-icon">{s.icon}</span>
                  <strong>{s.label}</strong>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Right / Trending column */}
      <aside className="trending-column">
        <TrendingFeed />
      </aside>
    </div>
  )
}

export default Home
