"use client"

import { Play, Pause, RotateCcw, Plus, Minus, Zap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Neuron, Level } from "@/lib/game-engine"

interface ControlPanelProps {
  level: Level
  accuracy: number
  loss: number
  epoch: number
  isTraining: boolean
  learningRate: number
  selectedNeuron: Neuron | null
  layerSizes: number[]
  onToggleTraining: () => void
  onReset: () => void
  onLearningRateChange: (val: number) => void
  onAddNeuron: (layer: number) => void
  onRemoveNeuron: (layer: number) => void
  onAddLayer: () => void
  onRemoveLayer: () => void
  onChangeActivation: (neuronId: string, fn: Neuron["activationFn"]) => void
  onNextLevel: () => void
  hasWon: boolean
  totalNeurons: number
}

export function ControlPanel({
  level,
  accuracy,
  loss,
  epoch,
  isTraining,
  learningRate,
  selectedNeuron,
  layerSizes,
  onToggleTraining,
  onReset,
  onLearningRateChange,
  onAddNeuron,
  onRemoveNeuron,
  onAddLayer,
  onRemoveLayer,
  onChangeActivation,
  onNextLevel,
  hasWon,
  totalNeurons,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {/* Level Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Level {level.id}
          </span>
        </div>
        <h2 className="text-lg font-sans font-bold text-foreground leading-tight">{level.name}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{level.description}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Accuracy"
          value={`${accuracy.toFixed(1)}%`}
          target={`Target: ${level.targetAccuracy}%`}
          color={accuracy >= level.targetAccuracy ? "text-primary" : "text-accent"}
        />
        <MetricCard label="Loss" value={loss.toFixed(4)} target="Lower is better" color="text-chart-3" />
        <MetricCard label="Epoch" value={epoch.toString()} target="Training steps" color="text-foreground" />
        <MetricCard
          label="Neurons"
          value={`${totalNeurons}/${level.maxNeurons}`}
          target="Budget"
          color={totalNeurons > level.maxNeurons ? "text-destructive" : "text-foreground"}
        />
      </div>

      {/* Accuracy Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">Progress</span>
          <span className="text-xs font-mono text-primary">{accuracy.toFixed(1)}% / {level.targetAccuracy}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((accuracy / level.targetAccuracy) * 100, 100)}%`,
              background: accuracy >= level.targetAccuracy
                ? "hsl(168, 80%, 50%)"
                : "hsl(200, 80%, 55%)",
              boxShadow: accuracy >= level.targetAccuracy
                ? "0 0 10px hsla(168, 80%, 50%, 0.5)"
                : "none",
            }}
          />
        </div>
      </div>

      {/* Training Controls */}
      <div className="flex gap-2">
        <Button
          onClick={onToggleTraining}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          {isTraining ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span className="text-xs font-mono">{isTraining ? "Pause" : "Train"}</span>
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="gap-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="text-xs font-mono">Reset</span>
        </Button>
      </div>

      {/* Learning Rate */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">Learning Rate</span>
          <span className="text-xs font-mono text-primary">{learningRate.toFixed(3)}</span>
        </div>
        <Slider
          value={[learningRate]}
          onValueChange={(v) => onLearningRateChange(v[0])}
          min={0.001}
          max={0.5}
          step={0.001}
          className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
        />
      </div>

      {/* Architecture Controls */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Architecture</span>
        <div className="space-y-1.5">
          {layerSizes.map((size, idx) => (
            <div key={idx} className="flex items-center justify-between bg-secondary/50 rounded px-2.5 py-1.5">
              <span className="text-xs font-mono text-muted-foreground">
                {idx === 0 ? "Input" : idx === layerSizes.length - 1 ? "Output" : `Hidden ${idx}`}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-foreground w-4 text-center">{size}</span>
                {idx > 0 && idx < layerSizes.length - 1 && (
                  <>
                    <button
                      onClick={() => onRemoveNeuron(idx)}
                      className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                      disabled={size <= 1}
                      aria-label={`Remove neuron from layer ${idx}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onAddNeuron(idx)}
                      className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                      disabled={totalNeurons >= level.maxNeurons}
                      aria-label={`Add neuron to layer ${idx}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAddLayer}
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-mono border-border text-muted-foreground hover:text-primary hover:border-primary/50"
            disabled={layerSizes.length >= 6}
          >
            <Plus className="h-3 w-3 mr-1" /> Layer
          </Button>
          <Button
            onClick={onRemoveLayer}
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-mono border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
            disabled={layerSizes.length <= 2}
          >
            <Minus className="h-3 w-3 mr-1" /> Layer
          </Button>
        </div>
      </div>

      {/* Selected Neuron */}
      {selectedNeuron && (
        <div className="space-y-2 bg-secondary/30 rounded-lg p-3 border border-border">
          <span className="text-xs font-mono text-primary uppercase tracking-wider">Selected Neuron</span>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-muted-foreground">ID</span>
              <span className="font-mono text-foreground">{selectedNeuron.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-mono text-muted-foreground">Activation</span>
              <span className="font-mono text-primary">{selectedNeuron.activation.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-mono text-muted-foreground">Bias</span>
              <span className="font-mono text-foreground">{selectedNeuron.bias.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-muted-foreground">Function</span>
              <div className="flex gap-1">
                {(["relu", "sigmoid", "tanh"] as const).map((fn) => (
                  <button
                    key={fn}
                    onClick={() => onChangeActivation(selectedNeuron.id, fn)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      selectedNeuron.activationFn === fn
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {fn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Win State */}
      {hasWon && (
        <div className="space-y-2 bg-primary/10 border border-primary/30 rounded-lg p-3">
          <p className="text-xs font-mono text-primary font-bold">
            {level.unlockMessage}
          </p>
          {level.id < 5 && (
            <Button
              onClick={onNextLevel}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              <span className="text-xs font-mono">Next Level</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  target,
  color,
}: {
  label: string
  value: string
  target: string
  color: string
}) {
  return (
    <div className="bg-secondary/40 rounded-lg p-2.5 border border-border/50">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-mono font-bold ${color} leading-tight`}>{value}</p>
      <p className="text-[9px] font-mono text-muted-foreground">{target}</p>
    </div>
  )
}
