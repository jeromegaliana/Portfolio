import { useRef, useState, useCallback } from 'react'

export function useAudioAnalyzer() {
  const audioCtxRef = useRef(null)
  const analyzerRef = useRef(null)
  const sourceRef = useRef(null)
  const audioElRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [fileName, setFileName] = useState('')
  const [inputMode, setInputMode] = useState('file') // 'file' | 'mic'
  const [error, setError] = useState('')

  const fftSize = 2048

  const initContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const analyzer = audioCtxRef.current.createAnalyser()
      analyzer.fftSize = fftSize
      analyzer.smoothingTimeConstant = 0.82
      analyzerRef.current = analyzer
    }
    return audioCtxRef.current
  }, [])

  const disconnectSource = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.disconnect() } catch (_) {}
      sourceRef.current = null
    }
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current.src = ''
      audioElRef.current = null
    }
  }, [])

  const loadFile = useCallback((file) => {
    setError('')
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (mp3, wav, ogg…)')
      return
    }

    disconnectSource()
    const ctx = initContext()
    if (ctx.state === 'suspended') ctx.resume()

    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.crossOrigin = 'anonymous'
    audioElRef.current = audio

    const source = ctx.createMediaElementSource(audio)
    source.connect(analyzerRef.current)
    analyzerRef.current.connect(ctx.destination)
    sourceRef.current = source

    audio.addEventListener('ended', () => setIsPlaying(false))
    setFileName(file.name)
    setIsLoaded(true)
    setInputMode('file')
    setIsPlaying(false)
  }, [initContext, disconnectSource])

  const togglePlay = useCallback(() => {
    const audio = audioElRef.current
    if (!audio) return
    const ctx = audioCtxRef.current
    if (ctx?.state === 'suspended') ctx.resume()

    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  const startMic = useCallback(async () => {
    setError('')
    disconnectSource()
    const ctx = initContext()
    if (ctx.state === 'suspended') ctx.resume()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyzerRef.current)
      // Do NOT connect to destination to avoid feedback
      sourceRef.current = source
      setInputMode('mic')
      setIsLoaded(true)
      setIsPlaying(true)
      setFileName('Microphone')
    } catch (err) {
      setError('Microphone access denied.')
      console.error(err)
    }
  }, [initContext, disconnectSource])

  const getFrequencyData = useCallback(() => {
    if (!analyzerRef.current) return new Uint8Array(0)
    const bufferLength = analyzerRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyzerRef.current.getByteFrequencyData(dataArray)
    return dataArray
  }, [])

  const getTimeDomainData = useCallback(() => {
    if (!analyzerRef.current) return new Uint8Array(0)
    const bufferLength = analyzerRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyzerRef.current.getByteTimeDomainData(dataArray)
    return dataArray
  }, [])

  return {
    isPlaying,
    isLoaded,
    fileName,
    inputMode,
    error,
    loadFile,
    togglePlay,
    startMic,
    getFrequencyData,
    getTimeDomainData,
    analyzerRef,
  }
}
