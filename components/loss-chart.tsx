"use client"

import { useRef, useEffect, useCallback } from "react"

interface LossChartProps {
  lossHistory: number[]
  accuracyHistory: number[]
  targetAccuracy: number
}

export function LossChart({ lossHistory, accuracyHistory, targetAccuracy }: LossChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    ctx.fillStyle = "hsl(220, 18%, 7%)"
    ctx.fillRect(0, 0, w, h)

    const padding = { top: 20, right: 12, bottom: 20, left: 35 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    // Grid lines
    ctx.strokeStyle = "hsla(220, 15%, 14%, 0.5)"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()
    }

    // Y-axis labels
    ctx.fillStyle = "hsl(210, 20%, 40%)"
    ctx.font = "9px monospace"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      const val = 100 - i * 25
      ctx.fillText(`${val}%`, padding.left - 5, y)
    }

    // Target line
    const targetY = padding.top + chartH * (1 - targetAccuracy / 100)
    ctx.strokeStyle = "hsla(168, 80%, 50%, 0.3)"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(padding.left, targetY)
    ctx.lineTo(w - padding.right, targetY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = "hsl(168, 80%, 50%)"
    ctx.font = "8px monospace"
    ctx.textAlign = "left"
    ctx.fillText("TARGET", w - padding.right - 38, targetY - 5)

    // Draw accuracy curve
    if (accuracyHistory.length > 1) {
      const points = accuracyHistory.slice(-200)
      ctx.beginPath()
      ctx.strokeStyle = "hsl(200, 80%, 55%)"
      ctx.lineWidth = 1.5
      for (let i = 0; i < points.length; i++) {
        const x = padding.left + (i / (points.length - 1)) * chartW
        const y = padding.top + chartH * (1 - points[i] / 100)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Glow effect
      ctx.strokeStyle = "hsla(200, 80%, 55%, 0.2)"
      ctx.lineWidth = 4
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        const x = padding.left + (i / (points.length - 1)) * chartW
        const y = padding.top + chartH * (1 - points[i] / 100)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Draw loss curve (scaled to fit)
    if (lossHistory.length > 1) {
      const points = lossHistory.slice(-200)
      const maxLoss = Math.max(...points, 0.1)
      ctx.beginPath()
      ctx.strokeStyle = "hsla(45, 90%, 55%, 0.7)"
      ctx.lineWidth = 1
      for (let i = 0; i < points.length; i++) {
        const x = padding.left + (i / (points.length - 1)) * chartW
        const y = padding.top + chartH * (1 - (1 - points[i] / maxLoss))
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Legend
    ctx.font = "8px monospace"
    ctx.fillStyle = "hsl(200, 80%, 55%)"
    ctx.fillRect(padding.left, padding.top - 14, 8, 2)
    ctx.fillText("Accuracy", padding.left + 12, padding.top - 11)
    ctx.fillStyle = "hsl(45, 90%, 55%)"
    ctx.fillRect(padding.left + 65, padding.top - 14, 8, 2)
    ctx.fillText("Loss", padding.left + 77, padding.top - 11)
  }, [lossHistory, accuracyHistory, targetAccuracy])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      role="img"
      aria-label="Training loss and accuracy chart"
    />
  )
}
