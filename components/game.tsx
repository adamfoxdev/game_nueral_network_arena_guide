"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { NetworkCanvas } from "@/components/network-canvas"
import { ControlPanel } from "@/components/control-panel"
import { LossChart } from "@/components/loss-chart"
import { LevelSelector } from "@/components/level-selector"
import {
  LEVELS,
  generateData,
  buildNetwork,
  computeAccuracy,
  trainStep,
} from "@/lib/game-engine"
import type { Neuron, Connection, DataPoint } from "@/lib/game-engine"
import { LevelGuide } from "@/components/level-guide"
import { Brain, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Game() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set())
  const [layerSizes, setLayerSizes] = useState<number[]>([2, 1])
  const [neurons, setNeurons] = useState<Neuron[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [data, setData] = useState<DataPoint[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [learningRate, setLearningRate] = useState(0.05)
  const [epoch, setEpoch] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [loss, setLoss] = useState(0)
  const [lossHistory, setLossHistory] = useState<number[]>([])
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([])
  const [selectedNeuronId, setSelectedNeuronId] = useState<string | null>(null)
  const [hasWon, setHasWon] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const trainingRef = useRef(false)
  const neuronsRef = useRef(neurons)
  const connectionsRef = useRef(connections)
  const dataRef = useRef(data)

  neuronsRef.current = neurons
  connectionsRef.current = connections
  dataRef.current = data

  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0]

  const initLevel = useCallback(
    (levelId: number) => {
      const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]
      const newData = generateData(level.dataPattern, 200)
      const newLayers = [...level.initialLayers]
      const { neurons: newNeurons, connections: newConns } = buildNetwork(newLayers)

      setLayerSizes(newLayers)
      setNeurons(newNeurons)
      setConnections(newConns)
      setData(newData)
      setEpoch(0)
      setAccuracy(0)
      setLoss(0)
      setLossHistory([])
      setAccuracyHistory([])
      setSelectedNeuronId(null)
      setHasWon(false)
      setIsTraining(false)
      trainingRef.current = false

      // Compute initial accuracy
      const initialAcc = computeAccuracy(newData, newNeurons, newConns)
      setAccuracy(initialAcc)
    },
    []
  )

  useEffect(() => {
    initLevel(1)
  }, [initLevel])

  const handleSelectLevel = useCallback(
    (id: number) => {
      setCurrentLevelId(id)
      initLevel(id)
    },
    [initLevel]
  )

  const handleReset = useCallback(() => {
    initLevel(currentLevelId)
  }, [initLevel, currentLevelId])

  const handleToggleTraining = useCallback(() => {
    if (isTraining) {
      setIsTraining(false)
      trainingRef.current = false
    } else {
      setIsTraining(true)
      trainingRef.current = true
    }
  }, [isTraining])

  useEffect(() => {
    if (!isTraining) return
    let running = true

    const step = () => {
      if (!running || !trainingRef.current) return

      const result = trainStep(
        dataRef.current,
        neuronsRef.current,
        connectionsRef.current,
        learningRate
      )

      setNeurons(result.neurons)
      setConnections(result.connections)
      setLoss(result.loss)
      setEpoch((e) => e + 1)

      const acc = computeAccuracy(dataRef.current, result.neurons, result.connections)
      setAccuracy(acc)
      setLossHistory((h) => [...h.slice(-199), result.loss])
      setAccuracyHistory((h) => [...h.slice(-199), acc])

      if (acc >= currentLevel.targetAccuracy && !hasWon) {
        setHasWon(true)
        setCompletedLevels((prev) => new Set([...prev, currentLevelId]))
        trainingRef.current = false
        setIsTraining(false)
        return
      }

      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)

    return () => {
      running = false
    }
  }, [isTraining, learningRate, currentLevel.targetAccuracy, hasWon, currentLevelId])

  const handleAddNeuron = useCallback(
    (layer: number) => {
      const totalNeurons = layerSizes.reduce((a, b) => a + b, 0)
      if (totalNeurons >= currentLevel.maxNeurons) return

      const newLayers = [...layerSizes]
      newLayers[layer]++
      setLayerSizes(newLayers)
      const { neurons: newNeurons, connections: newConns } = buildNetwork(newLayers)
      setNeurons(newNeurons)
      setConnections(newConns)
      const acc = computeAccuracy(data, newNeurons, newConns)
      setAccuracy(acc)
    },
    [layerSizes, currentLevel.maxNeurons, data]
  )

  const handleRemoveNeuron = useCallback(
    (layer: number) => {
      if (layerSizes[layer] <= 1) return
      const newLayers = [...layerSizes]
      newLayers[layer]--
      setLayerSizes(newLayers)
      const { neurons: newNeurons, connections: newConns } = buildNetwork(newLayers)
      setNeurons(newNeurons)
      setConnections(newConns)
      const acc = computeAccuracy(data, newNeurons, newConns)
      setAccuracy(acc)
    },
    [layerSizes, data]
  )

  const handleAddLayer = useCallback(() => {
    if (layerSizes.length >= 6) return
    const newLayers = [...layerSizes]
    newLayers.splice(newLayers.length - 1, 0, 3)
    setLayerSizes(newLayers)
    const { neurons: newNeurons, connections: newConns } = buildNetwork(newLayers)
    setNeurons(newNeurons)
    setConnections(newConns)
    const acc = computeAccuracy(data, newNeurons, newConns)
    setAccuracy(acc)
  }, [layerSizes, data])

  const handleRemoveLayer = useCallback(() => {
    if (layerSizes.length <= 2) return
    const newLayers = [...layerSizes]
    newLayers.splice(newLayers.length - 2, 1)
    setLayerSizes(newLayers)
    const { neurons: newNeurons, connections: newConns } = buildNetwork(newLayers)
    setNeurons(newNeurons)
    setConnections(newConns)
    const acc = computeAccuracy(data, newNeurons, newConns)
    setAccuracy(acc)
  }, [layerSizes, data])

  const handleChangeActivation = useCallback(
    (neuronId: string, fn: Neuron["activationFn"]) => {
      setNeurons((prev) =>
        prev.map((n) => (n.id === neuronId ? { ...n, activationFn: fn } : n))
      )
    },
    []
  )

  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1
    if (nextId <= LEVELS.length) {
      setCurrentLevelId(nextId)
      initLevel(nextId)
    }
  }, [currentLevelId, initLevel])

  const selectedNeuron = neurons.find((n) => n.id === selectedNeuronId) ?? null
  const totalNeurons = layerSizes.reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-bold text-foreground leading-tight">
              Neural Network Arena
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground">
              Build. Train. Conquer.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span>Click neurons to inspect</span>
            <span className="text-border">|</span>
            <span>Add layers & neurons to shape your network</span>
            <span className="text-border">|</span>
            <span>Hit Train to optimize</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(true)}
            className="gap-1.5 text-muted-foreground hover:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-xs font-mono">Guide</span>
          </Button>
        </div>
      </header>

      {/* Level Bar */}
      <LevelSelector
        levels={LEVELS}
        currentLevel={currentLevelId}
        completedLevels={completedLevels}
        onSelectLevel={handleSelectLevel}
      />

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas Area */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 min-h-0">
            <NetworkCanvas
              neurons={neurons}
              connections={connections}
              data={data}
              selectedNeuron={selectedNeuronId}
              onSelectNeuron={setSelectedNeuronId}
              isTraining={isTraining}
            />
          </div>
          {/* Loss Chart */}
          <div className="h-[140px] border-t border-border bg-card">
            <LossChart
              lossHistory={lossHistory}
              accuracyHistory={accuracyHistory}
              targetAccuracy={currentLevel.targetAccuracy}
            />
          </div>
        </div>

        {/* Side Panel */}
        <aside className="w-[280px] border-l border-border bg-card hidden md:block overflow-hidden">
          <ControlPanel
            level={currentLevel}
            accuracy={accuracy}
            loss={loss}
            epoch={epoch}
            isTraining={isTraining}
            learningRate={learningRate}
            selectedNeuron={selectedNeuron}
            layerSizes={layerSizes}
            onToggleTraining={handleToggleTraining}
            onReset={handleReset}
            onLearningRateChange={setLearningRate}
            onAddNeuron={handleAddNeuron}
            onRemoveNeuron={handleRemoveNeuron}
            onAddLayer={handleAddLayer}
            onRemoveLayer={handleRemoveLayer}
            onChangeActivation={handleChangeActivation}
            onNextLevel={handleNextLevel}
            hasWon={hasWon}
            totalNeurons={totalNeurons}
          />
        </aside>
      </div>

      {/* Mobile Controls (shown on small screens) */}
      <div className="md:hidden border-t border-border bg-card max-h-[45vh] overflow-y-auto">
        <ControlPanel
          level={currentLevel}
          accuracy={accuracy}
          loss={loss}
          epoch={epoch}
          isTraining={isTraining}
          learningRate={learningRate}
          selectedNeuron={selectedNeuron}
          layerSizes={layerSizes}
          onToggleTraining={handleToggleTraining}
          onReset={handleReset}
          onLearningRateChange={setLearningRate}
          onAddNeuron={handleAddNeuron}
          onRemoveNeuron={handleRemoveNeuron}
          onAddLayer={handleAddLayer}
          onRemoveLayer={handleRemoveLayer}
          onChangeActivation={handleChangeActivation}
          onNextLevel={handleNextLevel}
          hasWon={hasWon}
          totalNeurons={totalNeurons}
        />
      </div>

      {/* Level Guide Modal */}
      {showGuide && <LevelGuide onClose={() => setShowGuide(false)} />}
    </div>
  )
}
