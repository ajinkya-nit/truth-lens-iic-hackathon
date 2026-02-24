import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

function UploadZone({ onTextSubmit, onImageSubmit, loading }) {
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: loading,
  })

  const handleTextVerify = () => {
    if (textInput.trim().length < 10) return
    onTextSubmit(textInput.trim())
  }

  const handleImageVerify = () => {
    if (!uploadedFile) return
    onImageSubmit(uploadedFile)
  }

  const clearImage = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="upload-zone-container">
      {/* Tab switcher */}
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
          disabled={loading}
        >
          📝 Text / URL
        </button>
        <button
          className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
          disabled={loading}
        >
          🖼️ Image / Screenshot
        </button>
      </div>

      {/* Text input */}
      {activeTab === 'text' && (
        <div className="input-panel">
          <textarea
            className="text-input"
            placeholder="Paste a suspicious headline, WhatsApp forward, news article, or any claim you want to verify…"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={6}
            disabled={loading}
          />
          <div className="char-count">{textInput.length} characters</div>
          <button
            className="verify-btn"
            onClick={handleTextVerify}
            disabled={loading || textInput.trim().length < 10}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Analysing…
              </span>
            ) : (
              '🔍 Verify Now'
            )}
          </button>
        </div>
      )}

      {/* Image drop zone */}
      {activeTab === 'image' && (
        <div className="input-panel">
          {!previewUrl ? (
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'drag-active' : ''} ${loading ? 'disabled' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <span className="drop-icon">📁</span>
                {isDragActive ? (
                  <p>Drop the image here…</p>
                ) : (
                  <>
                    <p>Drag & drop an image here, or click to browse</p>
                    <p className="drop-hint">Supports JPEG, PNG, GIF, WEBP — max 10 MB</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="image-preview-wrapper">
              <img src={previewUrl} alt="Uploaded preview" className="image-preview" />
              <button className="clear-image-btn" onClick={clearImage} disabled={loading}>
                ✕ Remove
              </button>
            </div>
          )}
          <button
            className="verify-btn"
            onClick={handleImageVerify}
            disabled={loading || !uploadedFile}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Analysing…
              </span>
            ) : (
              '🔍 Verify Image'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadZone
