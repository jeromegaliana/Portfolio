import { useState, useRef, useCallback } from 'react'
import Visualizer from './components/Visualizer.jsx'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer.js'

const MODES = [
  { id: 'bars', label: 'Bars', icon: '▊' },
  { id: 'wave', label: 'Wave', icon: '〜' },
  { id: 'circle', label: 'Circle', icon: '◎' },
]

const THEMES = [
  { id: 'neon', label: 'Neon', color: '#a855f7' },
  { id: 'fire', label: 'Fire', color: '#f97316' },
  { id: 'ocean', label: 'Ocean', color: '#06b6d4' },
  { id: 'mono', label: 'Mono', color: '#9ca3af' },
]

export default function App() {
  const [mode, setMode] = useState('bars')
  const [theme, setTheme] = useState('neon')
  const [sensitivity, setSensitivity] = useState(1)
  const fileInputRef = useRef(null)

  const {
    isPlaying, isLoaded, fileName, inputMode, error,
    loadFile, togglePlay, startMic,
    getFrequencyData, getTimeDomainData,
  } = useAudioAnalyzer()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  const handleDragOver = useCallback((e) => e.preventDefault(), [])

  const themeColor = THEMES.find(t => t.id === theme)?.color ?? '#a855f7'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050508' }}>
      {/* Header */}
      <header style={{
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎵</span>
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em', opacity: 0.9 }}>
            MUSIC VISUALIZER
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
          Web Audio API
        </div>
      </header>

      {/* Canvas */}
      <div
        style={{ flex: 1, padding: '16px 28px', minHeight: '0' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div style={{ height: '100%', minHeight: '320px', position: 'relative' }}>
          {!isLoaded && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', gap: '12px',
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>🎵</div>
              <div style={{ fontSize: '15px', fontWeight: 600, opacity: 0.6 }}>
                Drop an audio file or click to browse
              </div>
              <div style={{ fontSize: '12px', opacity: 0.3 }}>mp3 · wav · ogg · flac</div>
            </div>
          )}
          <Visualizer
            getFrequencyData={getFrequencyData}
            getTimeDomainData={getTimeDomainData}
            isPlaying={isPlaying}
            isLoaded={isLoaded}
            mode={mode}
            theme={theme}
            sensitivity={sensitivity}
          />
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '16px 28px 28px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}>
        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 16px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Row 1: File info + play + mic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => loadFile(e.target.files[0])}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={btnStyle('rgba(255,255,255,0.08)')}
          >
            📂 Open file
          </button>

          <button
            onClick={startMic}
            style={btnStyle(inputMode === 'mic' && isLoaded ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)')}
          >
            🎙 Microphone
          </button>

          {isLoaded && inputMode === 'file' && (
            <button
              onClick={togglePlay}
              style={btnStyle(`${themeColor}33`, { minWidth: 52, fontWeight: 700, fontSize: 20 })}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
          )}

          {fileName && (
            <span style={{
              fontSize: '13px', opacity: 0.45,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '220px',
            }}>
              {fileName}
            </span>
          )}
        </div>

        {/* Row 2: Mode + Theme + Sensitivity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>

          {/* Mode */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={pillStyle(mode === m.id, themeColor)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: 28, background: 'rgba(255,255,255,0.1)' }} />

          {/* Theme */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: t.color,
                  border: theme === t.id ? `2px solid white` : '2px solid transparent',
                  transform: theme === t.id ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: theme === t.id ? `0 0 10px ${t.color}88` : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <div style={{ width: '1px', height: 28, background: 'rgba(255,255,255,0.1)' }} />

          {/* Sensitivity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', opacity: 0.4, letterSpacing: '0.08em' }}>SENS</span>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.05"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              style={{ width: '100px', accentColor: themeColor }}
            />
            <span style={{ fontSize: '12px', opacity: 0.4, minWidth: '28px' }}>
              {sensitivity.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function btnStyle(bg, extra = {}) {
  return {
    padding: '8px 16px',
    background: bg,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ...extra,
  }
}

function pillStyle(active, color) {
  return {
    padding: '6px 14px',
    borderRadius: '999px',
    background: active ? `${color}22` : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.08)'}`,
    color: active ? color : 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    letterSpacing: '0.04em',
  }
}
