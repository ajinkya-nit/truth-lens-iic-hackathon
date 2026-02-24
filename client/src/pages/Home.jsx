import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UploadZone from "../components/UploadZone";
import ResultCard from "../components/ResultCard";
import TrendingFeed from "../components/TrendingFeed";
import { verifyText, verifyImage } from "../services/api";

const LOADER_MESSAGES = [
  {
    status: "🔍 Scanning the web…",
    sub: "Searching trusted fact-check databases",
  },
  { status: "🤖 Analysing with AI…", sub: "Gemini is processing the claim" },
  {
    status: "📊 Comparing evidence…",
    sub: "Cross-referencing multiple sources",
  },
  { status: "⚖️ Generating verdict…", sub: "Almost there…" },
];

function VerifyingLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADER_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const msg = LOADER_MESSAGES[msgIndex];

  return (
    <div className="global-loader">
      <div className="loader-orb-container">
        <div className="loader-orb" />
        <div className="loader-ring-outer" />
      </div>
      <div className="loader-text-container">
        <p className="loader-status">{msg.status}</p>
        <p className="loader-substatus">{msg.sub}</p>
      </div>
      <div className="loader-dots">
        <span className="loader-dot" />
        <span className="loader-dot" />
        <span className="loader-dot" />
      </div>
    </div>
  );
}

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("official");

  const handleTextSubmit = async (text) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyText(text, searchMode);
      setResult(res.data.data);
      toast.success("Verification complete!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (file) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyImage(file, searchMode);
      setResult(res.data.data);
      toast.success("Verification complete!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setResult(null);

  return (
    <div className="home-layout">
      {/* Left / Main column */}
      <section className="main-column">
        <div className="hero">
          <h1 className="hero-title">
            Combat Misinformation.
            <br />
            <span className="hero-highlight">Instantly.</span>
          </h1>
          <p className="hero-sub">
            Paste any suspicious text or drop an image/screenshot. TruthLens
            uses Gemini AI and real-time web search to deliver a verdict in
            seconds — backed by real sources.
          </p>
        </div>

        {loading && <VerifyingLoader />}

        {!result && !loading && (
          <UploadZone
            onTextSubmit={handleTextSubmit}
            onImageSubmit={handleImageSubmit}
            loading={loading}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
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
                {
                  step: "1",
                  icon: "📥",
                  label: "Upload",
                  desc: "Paste text or drop an image",
                },
                {
                  step: "2",
                  icon: "🤖",
                  label: "AI Extracts Claim",
                  desc: "Gemini understands & summarises the core claim",
                },
                {
                  step: "3",
                  icon: "🔎",
                  label: "Web Search",
                  desc: "Tavily scours fact-check sites in real time",
                },
                {
                  step: "4",
                  icon: "⚖️",
                  label: "Verdict",
                  desc: "AI compares claim vs evidence & returns a verdict",
                },
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
  );
}

export default Home;
