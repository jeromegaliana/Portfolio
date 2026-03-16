import { useEffect, useRef, useCallback } from 'react'

const THEMES = {
  neon: {
    bg: 'rgba(5, 5, 8, 0.25)',
    bars: (ctx, x, y, w, h, ratio) => {
      const grad = ctx.createLinearGradient(x, y + h, x, y)
      grad.addColorStop(0, `hsl(${260 + ratio * 60}, 100%, 55%)`)
      grad.addColorStop(0.5, `hsl(${180 + ratio * 80}, 100%, 65%)`)
      grad.addColorStop(1, `hsl(${120 + ratio * 120}, 100%, 75%)`)
      return grad
    },
    wave: (ratio) => `hsl(${200 + ratio * 160}, 100%, 65%)`,
    circle: (ratio) => `hsl(${ratio * 360}, 100%, 65%)`,
  },
  fire: {
    bg: 'rgba(5, 2, 0, 0.25)',
    bars: (ctx, x, y, w, h, ratio) => {
      const grad = ctx.createLinearGradient(x, y + h, x, y)
      grad.addColorStop(0, '#ff0000')
      grad.addColorStop(0.5, '#ff6600')
      grad.addColorStop(1, '#ffff00')
      return grad
    },
    wave: (ratio) => `hsl(${ratio * 60}, 100%, 60%)`,
    circle: (ratio) => `hsl(${ratio * 60}, 100%, 60%)`,
  },
  ocean: {
    bg: 'rgba(0, 5, 15, 0.25)',
    bars: (ctx, x, y, w, h, ratio) => {
      const grad = ctx.createLinearGradient(x, y + h, x, y)
      grad.addColorStop(0, '#003080')
      grad.addColorStop(0.5, '#0088ff')
      grad.addColorStop(1, '#00ffee')
      return grad
    },
    wave: (ratio) => `hsl(${190 + ratio * 30}, 100%, 60%)`,
    circle: (ratio) => `hsl(${190 + ratio * 30}, 100%, 60%)`,
  },
  mono: {
    bg: 'rgba(5, 5, 5, 0.25)',
    bars: (ctx, x, y, w, h, ratio) => {
      const l = Math.round(30 + ratio * 70)
      return `hsl(0, 0%, ${l}%)`
    },
    wave: () => 'rgba(255,255,255,0.8)',
    circle: (ratio) => `hsl(0, 0%, ${40 + ratio * 60}%)`,
  },
}

function drawBars(ctx, data, width, height, theme, sensitivity) {
  const t = THEMES[theme]
  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, width, height)

  const barCount = Math.min(data.length, 128)
  const gap = 2
  const barW = (width - gap * barCount) / barCount

  for (let i = 0; i < barCount; i++) {
    const ratio = data[i] / 255
    const barH = ratio * height * sensitivity
    const x = i * (barW + gap)
    const y = height - barH

    ctx.fillStyle = t.bars(ctx, x, y, barW, barH, ratio)
    ctx.beginPath()
    ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0])
    ctx.fill()
  }
}

function drawWave(ctx, data, width, height, theme, sensitivity) {
  const t = THEMES[theme]
  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, width, height)

  ctx.lineWidth = 2
  ctx.beginPath()

  const sliceW = width / data.length
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const v = (data[i] / 128) - 1
    const y = (height / 2) + v * (height / 2) * sensitivity

    const ratio = i / data.length
    ctx.strokeStyle = t.wave(ratio)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceW
  }

  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

function drawCircle(ctx, data, width, height, theme, sensitivity) {
  const t = THEMES[theme]
  ctx.fillStyle = t.bg
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const baseR = Math.min(width, height) * 0.2
  const barCount = Math.min(data.length, 128)

  for (let i = 0; i < barCount; i++) {
    const ratio = data[i] / 255
    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2
    const barLen = ratio * baseR * 1.2 * sensitivity

    const x1 = cx + Math.cos(angle) * baseR
    const y1 = cy + Math.sin(angle) * baseR
    const x2 = cx + Math.cos(angle) * (baseR + barLen)
    const y2 = cy + Math.sin(angle) * (baseR + barLen)

    ctx.strokeStyle = t.circle(ratio)
    ctx.lineWidth = (width / barCount) * 0.8
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Inner glow circle
  const avgVol = data.slice(0, barCount).reduce((s, v) => s + v, 0) / barCount / 255
  const glowR = baseR * (0.85 + avgVol * 0.3 * sensitivity)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
  grad.addColorStop(0, t.circle(avgVol) + '33')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
  ctx.fill()
}

export default function Visualizer({ getFrequencyData, getTimeDomainData, isPlaying, isLoaded, mode, theme, sensitivity }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    if (!isLoaded) {
      // Idle animation
      ctx.fillStyle = 'rgba(5, 5, 8, 1)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      const t = Date.now() / 1000
      for (let i = 0; i < 32; i++) {
        const x = (i / 32) * width
        const h = (Math.sin(t * 1.5 + i * 0.4) * 0.5 + 0.5) * height * 0.15
        ctx.fillRect(x, height / 2 - h / 2, width / 32 - 2, h)
      }
      rafRef.current = requestAnimationFrame(draw)
      return
    }

    const freqData = getFrequencyData()
    const timeData = getTimeDomainData()

    if (mode === 'bars') drawBars(ctx, freqData, width, height, theme, sensitivity)
    else if (mode === 'wave') drawWave(ctx, timeData, width, height, theme, sensitivity)
    else if (mode === 'circle') drawCircle(ctx, freqData, width, height, theme, sensitivity)

    rafRef.current = requestAnimationFrame(draw)
  }, [isLoaded, isPlaying, mode, theme, sensitivity, getFrequencyData, getTimeDomainData])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })
    obs.observe(canvas)
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    return () => obs.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', borderRadius: '16px' }}
    />
  )
}
