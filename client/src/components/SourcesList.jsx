function SourcesList({ sources }) {
  return (
    <ul className="sources-list">
      {sources.map((src, idx) => (
        <li key={idx} className="source-item">
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            <span className="source-num">{idx + 1}</span>
            <span className="source-body">
              <strong className="source-title">{src.title || src.url}</strong>
              {src.snippet && <span className="source-snippet">{src.snippet}</span>}
            </span>
            <span className="source-arrow">↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default SourcesList
