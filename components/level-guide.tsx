"use client"

import { X, Layers, Target, Cpu, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface LevelGuideProps {
  onClose: () => void
}

const GUIDE_LEVELS = [
  {
    id: 1,
    name: "Linear Frontier",
    pattern: "linear",
    targetAccuracy: 90,
    maxNeurons: 8,
    initialArch: [2, 1],
    difficulty: "Beginner",
    concept: "Linear Separability",
    overview:
      "Two classes separated by a straight line. Class 0 occupies the left half of the feature space and Class 1 occupies the right. This is the simplest classification problem and serves as your warm-up.",
    mlInsight:
      "A single-layer perceptron (no hidden layers) can solve any linearly separable problem. This was proven by Rosenblatt in 1958. The decision boundary is a hyperplane defined by w1*x1 + w2*x2 + b = 0.",
    strategy: [
      "The default architecture (2 inputs, 1 output) is sufficient. No hidden layers needed.",
      "Hit Train immediately -- the sigmoid output neuron will learn the boundary fast.",
      "A learning rate around 0.05 works well. Going higher risks overshooting.",
      "If accuracy stalls, try resetting. Weight initialization matters even for simple problems.",
    ],
    activationTip:
      "Keep the output neuron on sigmoid. For this problem, activation function choice is not critical since the boundary is linear.",
    whatToWatch:
      "Observe the decision boundary in the Feature Space panel. You should see it shift from random to a clean vertical split as training progresses.",
  },
  {
    id: 2,
    name: "The Circle Problem",
    pattern: "circle",
    targetAccuracy: 85,
    maxNeurons: 12,
    initialArch: [2, 4, 1],
    difficulty: "Intermediate",
    concept: "Non-linear Decision Boundaries",
    overview:
      "Class 0 forms a cluster at the center, surrounded by a ring of Class 1 points. The boundary between them is a circle -- impossible to separate with a straight line.",
    mlInsight:
      "This demonstrates why hidden layers matter. A single perceptron can only draw linear boundaries. Adding a hidden layer with non-linear activations lets the network compose multiple linear boundaries into a curved one. This is the Universal Approximation Theorem in action.",
    strategy: [
      "The initial 2-4-1 architecture is a good starting point.",
      "If it struggles, try adding 1-2 more neurons to the hidden layer (up to 6).",
      "ReLU activations on the hidden layer are a good default. They train faster than sigmoid for hidden neurons.",
      "Learning rate of 0.03-0.08 tends to work. Too high and the boundary oscillates.",
    ],
    activationTip:
      "Use ReLU on hidden neurons for faster convergence. The output must stay sigmoid for binary classification. If training stalls, try switching a hidden neuron to tanh -- it can help with symmetric patterns like circles.",
    whatToWatch:
      "The decision boundary should gradually form a rough circle. You may see it start as angular approximations that smooth out over epochs.",
  },
  {
    id: 3,
    name: "XOR Paradox",
    pattern: "xor",
    targetAccuracy: 88,
    maxNeurons: 16,
    initialArch: [2, 4, 1],
    difficulty: "Intermediate",
    concept: "XOR / Feature Composition",
    overview:
      "The classic exclusive-or pattern: points in the top-left and bottom-right quadrants belong to one class, while top-right and bottom-left belong to the other. This problem famously cannot be solved by a single perceptron.",
    mlInsight:
      "Minsky and Papert showed in 1969 that XOR is not linearly separable, which contributed to the first AI winter. The solution requires at least one hidden layer. Conceptually, each hidden neuron learns to detect one of the linear boundaries, and the output neuron combines them.",
    strategy: [
      "2-4-1 should work, but 2-4-2-1 or adding neurons to the hidden layer can help.",
      "Be patient -- XOR can take more epochs than linear or circle problems.",
      "If training plateaus at ~50% accuracy, the network is stuck predicting one class. Reset and try again (weight initialization matters).",
      "A slightly lower learning rate (0.02-0.05) helps avoid oscillation on this symmetric problem.",
    ],
    activationTip:
      "ReLU works well here. If you see dead neurons (activation always 0.00), try switching them to tanh. Dead ReLU neurons can never recover because their gradient is zero for negative inputs.",
    whatToWatch:
      "Watch for the characteristic XOR boundary: two diagonal regions of one color separated by the other. The loss curve may show sudden drops as the network 'clicks' into the right configuration.",
  },
  {
    id: 4,
    name: "Crescent Moons",
    pattern: "moons",
    targetAccuracy: 82,
    maxNeurons: 20,
    initialArch: [2, 6, 4, 1],
    difficulty: "Advanced",
    concept: "Complex Curved Boundaries",
    overview:
      "Two interlocking crescent (half-moon) shapes. The classes partially wrap around each other, requiring the network to learn a smooth, curved decision boundary that follows the contour of each crescent.",
    mlInsight:
      "The moons dataset is a standard ML benchmark (sklearn.datasets.make_moons). It tests whether a model can learn non-convex boundaries. Two hidden layers help because the first layer can detect local features (edges of crescents) while the second combines them into the global shape.",
    strategy: [
      "The initial 2-6-4-1 architecture is well-suited. Don't over-engineer it.",
      "If accuracy plateaus around 70%, try adding 1-2 neurons to the first hidden layer.",
      "Moderate learning rate (0.03-0.06) prevents the boundary from becoming too jagged.",
      "Train for at least 200-300 epochs. Moons typically takes longer to converge than XOR.",
    ],
    activationTip:
      "Mix of ReLU and tanh in hidden layers can work well. Tanh's output range (-1 to 1) helps when the network needs to 'push' the boundary in both directions.",
    whatToWatch:
      "The decision boundary should gradually trace the gap between the two crescents. You may see it start jagged and smooth out. The noise in the data (0.08 std) means 82% is a reasonable ceiling without overfitting.",
  },
  {
    id: 5,
    name: "Spiral Descent",
    pattern: "spiral",
    targetAccuracy: 78,
    maxNeurons: 28,
    initialArch: [2, 8, 6, 4, 1],
    difficulty: "Expert",
    concept: "High-Frequency Decision Boundaries",
    overview:
      "Two interleaving spirals emanating from the center. This is widely considered one of the hardest 2D classification problems. The decision boundary must wind through increasingly tight curves as it moves outward.",
    mlInsight:
      "Spirals require the network to learn high-frequency spatial features -- the boundary must oscillate rapidly. This is why deeper networks help: each layer can refine the boundary further. In practice, even modern networks struggle with spirals without techniques like batch normalization or residual connections.",
    strategy: [
      "Use the full neuron budget (28). The initial 2-8-6-4-1 architecture is a solid foundation.",
      "Consider 2-8-8-6-4-1 if you have neuron budget left -- more capacity in early layers helps detect local spiral curvature.",
      "Use a lower learning rate (0.01-0.03). The loss landscape is rugged and higher rates cause divergence.",
      "Be prepared for 500+ epochs. The spiral problem rewards patience.",
      "If stuck at ~50%, reset. Spiral is highly sensitive to initial weight configuration.",
    ],
    activationTip:
      "Tanh in the first hidden layer can help due to its symmetric output. ReLU in subsequent layers for computational efficiency. Avoid sigmoid in hidden layers -- gradients vanish quickly in deep networks (the vanishing gradient problem).",
    whatToWatch:
      "The boundary will start as a rough blob and slowly develop spiral arms. You may notice 'jumps' in accuracy as the network discovers each spiral turn. 78% is a realistic target -- perfect accuracy on noisy spirals would require much larger networks.",
  },
]

export function LevelGuide({ onClose }: LevelGuideProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-lg shadow-2xl shadow-primary/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-sans font-bold text-foreground">Level Guide</h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Strategies, ML concepts, and tips for every level
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close level guide"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {GUIDE_LEVELS.map((level) => {
            const isExpanded = expandedLevel === level.id
            return (
              <div
                key={level.id}
                className={`rounded-lg border transition-colors ${
                  isExpanded
                    ? "border-primary/30 bg-primary/[0.03]"
                    : "border-border bg-secondary/20 hover:bg-secondary/30"
                }`}
              >
                {/* Level Header (Accordion) */}
                <button
                  onClick={() =>
                    setExpandedLevel(isExpanded ? null : level.id)
                  }
                  className="flex items-center justify-between w-full px-4 py-3 text-left"
                  aria-expanded={isExpanded}
                  aria-controls={`guide-level-${level.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold shrink-0">
                      {level.id}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-sm font-sans font-semibold text-foreground truncate">
                        {level.name}
                      </span>
                      <span className="block text-[10px] font-mono text-muted-foreground">
                        {level.difficulty} &middot; {level.concept} &middot;
                        Target: {level.targetAccuracy}%
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div
                    id={`guide-level-${level.id}`}
                    className="px-4 pb-4 space-y-4"
                  >
                    {/* Architecture badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        Arch: [{level.initialArch.join("-")}]
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground">
                        <Cpu className="h-3 w-3" />
                        Max Neurons: {level.maxNeurons}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Target: {level.targetAccuracy}%
                      </span>
                    </div>

                    {/* Overview */}
                    <Section title="Overview">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {level.overview}
                      </p>
                    </Section>

                    {/* ML Insight */}
                    <Section title="ML Insight" accent>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {level.mlInsight}
                      </p>
                    </Section>

                    {/* Strategy */}
                    <Section title="Strategy">
                      <ul className="space-y-1.5">
                        {level.strategy.map((tip, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-xs text-muted-foreground leading-relaxed"
                          >
                            <span className="text-primary shrink-0 mt-0.5">
                              {i + 1}.
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>

                    {/* Activation Tip */}
                    <div className="flex gap-2.5 rounded-md bg-chart-3/5 border border-chart-3/20 p-3">
                      <Lightbulb className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-mono font-bold text-chart-3 uppercase tracking-wider mb-1">
                          Activation Functions
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {level.activationTip}
                        </p>
                      </div>
                    </div>

                    {/* What to Watch */}
                    <Section title="What to Watch">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {level.whatToWatch}
                      </p>
                    </Section>
                  </div>
                )}
              </div>
            )
          })}

          {/* General Tips */}
          <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3 mt-4">
            <h3 className="text-sm font-sans font-semibold text-foreground">
              General Tips
            </h3>
            <ul className="space-y-2">
              {[
                "Click any neuron on the canvas to inspect its activation, bias, and change its activation function.",
                "Positive weights (teal connections) excite the downstream neuron; negative weights (red connections) inhibit it.",
                "The Feature Space panel shows the decision boundary in real-time. The background color indicates the network's prediction at each point.",
                "If training stalls, reset and try a different architecture. Network depth (layers) and width (neurons per layer) have different effects on what boundaries the model can learn.",
                "Lower learning rates give smoother convergence but train slower. Higher rates are riskier but can escape local minima.",
                "The loss chart helps you diagnose problems: flat loss means the network isn't learning, oscillating loss means the learning rate is too high, and smoothly decreasing loss means everything is working.",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs text-muted-foreground leading-relaxed"
                >
                  <span className="text-accent shrink-0">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  accent,
  children,
}: {
  title: string
  accent?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <h4
        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
          accent ? "text-primary" : "text-foreground/60"
        }`}
      >
        {title}
      </h4>
      {children}
    </div>
  )
}
