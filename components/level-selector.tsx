"use client"

import { Lock, CheckCircle2, Zap } from "lucide-react"
import type { Level } from "@/lib/game-engine"

interface LevelSelectorProps {
  levels: Level[]
  currentLevel: number
  completedLevels: Set<number>
  onSelectLevel: (id: number) => void
}

export function LevelSelector({
  levels,
  currentLevel,
  completedLevels,
  onSelectLevel,
}: LevelSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-card border-b border-border overflow-x-auto">
      {levels.map((level) => {
        const isCompleted = completedLevels.has(level.id)
        const isCurrent = level.id === currentLevel
        const isUnlocked = level.id === 1 || completedLevels.has(level.id - 1)

        return (
          <button
            key={level.id}
            onClick={() => isUnlocked && onSelectLevel(level.id)}
            disabled={!isUnlocked}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap
              ${isCurrent
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsla(168,80%,50%,0.3)]"
                : isCompleted
                  ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                  : isUnlocked
                    ? "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    : "bg-secondary/30 text-muted-foreground/40 cursor-not-allowed"
              }
            `}
            aria-label={`Level ${level.id}: ${level.name}${isCompleted ? " (completed)" : ""}${!isUnlocked ? " (locked)" : ""}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : isCurrent ? (
              <Zap className="h-3 w-3" />
            ) : !isUnlocked ? (
              <Lock className="h-3 w-3" />
            ) : null}
            <span>{level.name}</span>
          </button>
        )
      })}
    </div>
  )
}
