"use client"

import { useRef, useEffect, useCallback } from "react"
import type { Neuron, Connection, DataPoint } from "@/lib/game-engine"
import { forwardPass } from "@/lib/game-engine"

interface NetworkCanvasProps {
  neurons: Neuron[]
  connections: Connection[]
  data: DataPoint[]
  selectedNeuron: string | null
  onSelectNeuron: (id: string | null) => void
  isTraining: boolean
}

export function NetworkCanvas({
  neurons,
  connections,
  data,
  selectedNeuron,
  onSelectNeuron,
  isTraining,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

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

    timeRef.current += 0.016

    // Background
    ctx.fillStyle = "hsl(220, 20%, 4%)"
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = "hsla(220, 15%, 14%, 0.4)"
    ctx.lineWidth = 0.5
    const gridSize = 30
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Layout
    const padding = 60
    const networkW = w * 0.55
    const dataAreaX = networkW + 40
    const dataAreaW = w - dataAreaX - padding
    const dataAreaY = padding
    const dataAreaH = h - padding * 2

    // === Draw Decision Boundary ===
    const resolution = 4
    const cols = Math.ceil(dataAreaW / resolution)
    const rows = Math.ceil(dataAreaH / resolution)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = c / cols
        const py = r / rows
        const output = forwardPass([px, py], neurons, connections)
        const alpha = 0.15
        if (output >= 0.5) {
          ctx.fillStyle = `hsla(168, 80%, 50%, ${alpha})`
        } else {
          ctx.fillStyle = `hsla(200, 80%, 55%, ${alpha})`
        }
        ctx.fillRect(
          dataAreaX + c * resolution,
          dataAreaY + r * resolution,
          resolution,
          resolution
        )
      }
    }

    // === Draw Data Panel Border ===
    ctx.strokeStyle = "hsla(220, 15%, 20%, 0.6)"
    ctx.lineWidth = 1
    ctx.strokeRect(dataAreaX - 5, dataAreaY - 5, dataAreaW + 10, dataAreaH + 10)

    // Label
    ctx.fillStyle = "hsl(210, 20%, 50%)"
    ctx.font = "11px monospace"
    ctx.textAlign = "center"
    ctx.fillText("FEATURE SPACE", dataAreaX + dataAreaW / 2, dataAreaY - 12)

    // === Draw Data Points ===
    for (const point of data) {
      const px = dataAreaX + point.x * dataAreaW
      const py = dataAreaY + point.y * dataAreaH

      if (point.label === 0) {
        ctx.fillStyle = "hsl(200, 80%, 55%)"
        ctx.shadowColor = "hsl(200, 80%, 55%)"
      } else {
        ctx.fillStyle = "hsl(168, 80%, 50%)"
        ctx.shadowColor = "hsl(168, 80%, 50%)"
      }
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(px, py, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // === Draw Connections ===
    const neuronCoords = neurons.map((n) => ({
      ...n,
      px: padding + n.x * (networkW - padding * 2),
      py: padding + 20 + n.y * (h - padding * 2 - 40),
    }))

    for (const conn of connections) {
      const from = neuronCoords.find((n) => n.id === conn.from)
      const to = neuronCoords.find((n) => n.id === conn.to)
      if (!from || !to) continue

      const absWeight = Math.abs(conn.weight)
      const opacity = Math.min(0.3 + absWeight * 0.3, 0.9)
      const lineWidth = 0.5 + absWeight * 1.5

      if (conn.weight > 0) {
        ctx.strokeStyle = `hsla(168, 80%, 50%, ${opacity})`
      } else {
        ctx.strokeStyle = `hsla(0, 72%, 55%, ${opacity})`
      }
      ctx.lineWidth = lineWidth

      ctx.beginPath()
      ctx.moveTo(from.px, from.py)
      ctx.lineTo(to.px, to.py)
      ctx.stroke()

      // Signal animation
      if (isTraining && Math.abs(conn.signal) > 0.01) {
        const t = ((timeRef.current * 2 + Math.abs(conn.weight)) % 1)
        const sx = from.px + (to.px - from.px) * t
        const sy = from.py + (to.py - from.py) * t
        const signalSize = 2 + Math.abs(conn.signal) * 3

        ctx.fillStyle = conn.weight > 0
          ? "hsl(168, 80%, 60%)"
          : "hsl(0, 72%, 60%)"
        ctx.shadowColor = conn.weight > 0
          ? "hsl(168, 80%, 60%)"
          : "hsl(0, 72%, 60%)"
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(sx, sy, signalSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // === Draw Neurons ===
    for (const n of neuronCoords) {
      const isSelected = n.id === selectedNeuron
      const radius = isSelected ? 18 : 14
      const activation = Math.abs(n.activation)
      const glowIntensity = Math.min(activation * 0.6, 0.8)

      // Glow
      const gradient = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, radius * 2.5)
      gradient.addColorStop(0, `hsla(168, 80%, 50%, ${glowIntensity * 0.4})`)
      gradient.addColorStop(1, "hsla(168, 80%, 50%, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(n.px, n.py, radius * 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Neuron body
      ctx.fillStyle = `hsl(220, 18%, ${7 + activation * 8}%)`
      ctx.strokeStyle = isSelected
        ? "hsl(168, 80%, 50%)"
        : `hsla(168, 80%, 50%, ${0.3 + glowIntensity})`
      ctx.lineWidth = isSelected ? 2.5 : 1.5
      ctx.shadowColor = "hsl(168, 80%, 50%)"
      ctx.shadowBlur = isSelected ? 15 : 5
      ctx.beginPath()
      ctx.arc(n.px, n.py, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0

      // Activation value
      ctx.fillStyle = "hsl(210, 20%, 85%)"
      ctx.font = "bold 9px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(n.activation.toFixed(2), n.px, n.py)

      // Label
      if (n.layer === 0) {
        ctx.fillStyle = "hsl(210, 20%, 55%)"
        ctx.font = "9px monospace"
        ctx.fillText(n.index === 0 ? "x1" : "x2", n.px, n.py + radius + 12)
      }

      // Activation fn label
      if (n.layer > 0) {
        ctx.fillStyle = "hsl(210, 20%, 40%)"
        ctx.font = "8px monospace"
        ctx.fillText(n.activationFn, n.px, n.py - radius - 8)
      }
    }

    // Layer labels
    const layers = [...new Set(neurons.map((n) => n.layer))].sort((a, b) => a - b)
    for (const l of layers) {
      const layerNeurons = neuronCoords.filter((n) => n.layer === l)
      if (layerNeurons.length === 0) continue
      const avgX = layerNeurons.reduce((s, n) => s + n.px, 0) / layerNeurons.length

      ctx.fillStyle = "hsl(210, 20%, 40%)"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      if (l === 0) {
        ctx.fillText("INPUT", avgX, h - 15)
      } else if (l === layers[layers.length - 1]) {
        ctx.fillText("OUTPUT", avgX, h - 15)
      } else {
        ctx.fillText(`HIDDEN ${l}`, avgX, h - 15)
      }
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [neurons, connections, data, selectedNeuron, isTraining])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const w = rect.width
      const h = rect.height
      const padding = 60
      const networkW = w * 0.55

      let closest: string | null = null
      let closestDist = 25

      for (const n of neurons) {
        const px = padding + n.x * (networkW - padding * 2)
        const py = padding + 20 + n.y * (h - padding * 2 - 40)
        const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2)
        if (dist < closestDist) {
          closestDist = dist
          closest = n.id
        }
      }

      onSelectNeuron(closest)
    },
    [neurons, onSelectNeuron]
  )

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onClick={handleClick}
      role="img"
      aria-label="Neural network visualization canvas with data points and network architecture"
    />
  )
}
