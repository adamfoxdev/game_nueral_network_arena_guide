export interface Neuron {
  id: string
  x: number
  y: number
  layer: number
  index: number
  activation: number
  bias: number
  activationFn: "relu" | "sigmoid" | "tanh"
}

export interface Connection {
  id: string
  from: string
  to: string
  weight: number
  signal: number
}

export interface DataPoint {
  x: number
  y: number
  label: 0 | 1
}

export interface Level {
  id: number
  name: string
  description: string
  targetAccuracy: number
  dataPattern: "linear" | "circle" | "xor" | "spiral" | "moons" | "clusters"
  initialLayers: number[]
  maxNeurons: number
  unlockMessage: string
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Linear Frontier",
    description: "Separate two linearly separable classes. A warm-up for your neural cortex.",
    targetAccuracy: 90,
    dataPattern: "linear",
    initialLayers: [2, 1],
    maxNeurons: 8,
    unlockMessage: "You mastered linear separation!",
  },
  {
    id: 2,
    name: "The Circle Problem",
    description: "Points inside vs outside a circle. You'll need hidden layers for this one.",
    targetAccuracy: 85,
    dataPattern: "circle",
    initialLayers: [2, 4, 1],
    maxNeurons: 12,
    unlockMessage: "Non-linear boundaries conquered!",
  },
  {
    id: 3,
    name: "XOR Paradox",
    description: "The classic XOR problem that stumped early perceptrons. Can you solve it?",
    targetAccuracy: 88,
    dataPattern: "xor",
    initialLayers: [2, 4, 1],
    maxNeurons: 16,
    unlockMessage: "XOR defeated! Minsky would be proud.",
  },
  {
    id: 4,
    name: "Crescent Moons",
    description: "Two interlocking crescent shapes. Requires sophisticated decision boundaries.",
    targetAccuracy: 82,
    dataPattern: "moons",
    initialLayers: [2, 6, 4, 1],
    maxNeurons: 20,
    unlockMessage: "Beautiful boundary shaping!",
  },
  {
    id: 5,
    name: "Spiral Descent",
    description: "Two interleaving spirals. The ultimate test of your network architecture.",
    targetAccuracy: 78,
    dataPattern: "spiral",
    initialLayers: [2, 8, 6, 4, 1],
    maxNeurons: 28,
    unlockMessage: "Spiral master! You've graduated Neural Network Arena.",
  },
]

export function generateData(pattern: Level["dataPattern"], count: number = 200): DataPoint[] {
  const points: DataPoint[] = []
  const half = Math.floor(count / 2)

  switch (pattern) {
    case "linear": {
      for (let i = 0; i < half; i++) {
        points.push({
          x: Math.random() * 0.45 + 0.05,
          y: Math.random() * 0.9 + 0.05,
          label: 0,
        })
      }
      for (let i = 0; i < half; i++) {
        points.push({
          x: Math.random() * 0.45 + 0.5,
          y: Math.random() * 0.9 + 0.05,
          label: 1,
        })
      }
      break
    }
    case "circle": {
      for (let i = 0; i < half; i++) {
        const angle = Math.random() * Math.PI * 2
        const r = Math.random() * 0.2
        points.push({
          x: 0.5 + r * Math.cos(angle),
          y: 0.5 + r * Math.sin(angle),
          label: 0,
        })
      }
      for (let i = 0; i < half; i++) {
        const angle = Math.random() * Math.PI * 2
        const r = 0.25 + Math.random() * 0.2
        points.push({
          x: 0.5 + r * Math.cos(angle),
          y: 0.5 + r * Math.sin(angle),
          label: 1,
        })
      }
      break
    }
    case "xor": {
      for (let i = 0; i < count; i++) {
        const x = Math.random()
        const y = Math.random()
        const noise = (Math.random() - 0.5) * 0.1
        const isXor = (x > 0.5) !== (y > 0.5)
        points.push({
          x: x + noise * 0.5,
          y: y + noise * 0.5,
          label: isXor ? 1 : 0,
        })
      }
      break
    }
    case "moons": {
      for (let i = 0; i < half; i++) {
        const angle = Math.PI * (i / half)
        const noise = (Math.random() - 0.5) * 0.08
        points.push({
          x: 0.35 + 0.25 * Math.cos(angle) + noise,
          y: 0.4 + 0.25 * Math.sin(angle) + noise,
          label: 0,
        })
      }
      for (let i = 0; i < half; i++) {
        const angle = Math.PI + Math.PI * (i / half)
        const noise = (Math.random() - 0.5) * 0.08
        points.push({
          x: 0.55 + 0.25 * Math.cos(angle) + noise,
          y: 0.55 + 0.25 * Math.sin(angle) + noise,
          label: 1,
        })
      }
      break
    }
    case "spiral": {
      for (let i = 0; i < half; i++) {
        const t = (i / half) * 3 * Math.PI
        const r = t / (3 * Math.PI) * 0.35
        const noise = (Math.random() - 0.5) * 0.04
        points.push({
          x: 0.5 + r * Math.cos(t) + noise,
          y: 0.5 + r * Math.sin(t) + noise,
          label: 0,
        })
      }
      for (let i = 0; i < half; i++) {
        const t = (i / half) * 3 * Math.PI
        const r = t / (3 * Math.PI) * 0.35
        const noise = (Math.random() - 0.5) * 0.04
        points.push({
          x: 0.5 - r * Math.cos(t) + noise,
          y: 0.5 - r * Math.sin(t) + noise,
          label: 1,
        })
      }
      break
    }
    case "clusters": {
      const centers = [
        { x: 0.25, y: 0.25, label: 0 as const },
        { x: 0.75, y: 0.75, label: 0 as const },
        { x: 0.25, y: 0.75, label: 1 as const },
        { x: 0.75, y: 0.25, label: 1 as const },
      ]
      for (let i = 0; i < count; i++) {
        const c = centers[i % centers.length]
        points.push({
          x: c.x + (Math.random() - 0.5) * 0.2,
          y: c.y + (Math.random() - 0.5) * 0.2,
          label: c.label,
        })
      }
      break
    }
  }
  return points
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function relu(x: number): number {
  return Math.max(0, x)
}

function tanhFn(x: number): number {
  return Math.tanh(x)
}

function applyActivation(x: number, fn: Neuron["activationFn"]): number {
  switch (fn) {
    case "sigmoid":
      return sigmoid(x)
    case "relu":
      return relu(x)
    case "tanh":
      return tanhFn(x)
  }
}

export function buildNetwork(
  layerSizes: number[]
): { neurons: Neuron[]; connections: Connection[] } {
  const neurons: Neuron[] = []
  const connections: Connection[] = []

  layerSizes.forEach((size, layerIdx) => {
    for (let i = 0; i < size; i++) {
      const totalLayers = layerSizes.length
      const x = totalLayers === 1 ? 0.5 : (layerIdx / (totalLayers - 1))
      const y = size === 1 ? 0.5 : (i / (size - 1))
      neurons.push({
        id: `n-${layerIdx}-${i}`,
        x,
        y,
        layer: layerIdx,
        index: i,
        activation: 0,
        bias: (Math.random() - 0.5) * 0.5,
        activationFn: layerIdx === layerSizes.length - 1 ? "sigmoid" : "relu",
      })
    }
  })

  for (let l = 0; l < layerSizes.length - 1; l++) {
    const fromNeurons = neurons.filter((n) => n.layer === l)
    const toNeurons = neurons.filter((n) => n.layer === l + 1)
    for (const from of fromNeurons) {
      for (const to of toNeurons) {
        connections.push({
          id: `c-${from.id}-${to.id}`,
          from: from.id,
          to: to.id,
          weight: (Math.random() - 0.5) * 1.0,
          signal: 0,
        })
      }
    }
  }

  return { neurons, connections }
}

export function forwardPass(
  input: [number, number],
  neurons: Neuron[],
  connections: Connection[]
): number {
  const updatedNeurons = [...neurons]
  const layers = [...new Set(neurons.map((n) => n.layer))].sort((a, b) => a - b)

  // Set input layer
  const inputNeurons = updatedNeurons.filter((n) => n.layer === layers[0])
  inputNeurons.forEach((n, i) => {
    n.activation = input[i] ?? 0
  })

  // Forward through hidden and output layers
  for (let l = 1; l < layers.length; l++) {
    const layerNeurons = updatedNeurons.filter((n) => n.layer === layers[l])
    for (const neuron of layerNeurons) {
      const incomingConnections = connections.filter((c) => c.to === neuron.id)
      let sum = neuron.bias
      for (const conn of incomingConnections) {
        const fromNeuron = updatedNeurons.find((n) => n.id === conn.from)
        if (fromNeuron) {
          sum += fromNeuron.activation * conn.weight
          conn.signal = fromNeuron.activation * conn.weight
        }
      }
      neuron.activation = applyActivation(sum, neuron.activationFn)
    }
  }

  const outputNeuron = updatedNeurons.find((n) => n.layer === layers[layers.length - 1])
  return outputNeuron?.activation ?? 0
}

export function computeAccuracy(
  data: DataPoint[],
  neurons: Neuron[],
  connections: Connection[]
): number {
  let correct = 0
  for (const point of data) {
    const output = forwardPass([point.x, point.y], neurons, connections)
    const predicted = output >= 0.5 ? 1 : 0
    if (predicted === point.label) correct++
  }
  return (correct / data.length) * 100
}

export function trainStep(
  data: DataPoint[],
  neurons: Neuron[],
  connections: Connection[],
  learningRate: number = 0.1
): { neurons: Neuron[]; connections: Connection[]; loss: number } {
  const clonedNeurons = neurons.map((n) => ({ ...n }))
  const clonedConnections = connections.map((c) => ({ ...c }))
  let totalLoss = 0

  // Mini-batch gradient descent with numerical gradients
  const batchSize = Math.min(32, data.length)
  const batch = data.sort(() => Math.random() - 0.5).slice(0, batchSize)
  const epsilon = 0.001

  for (const conn of clonedConnections) {
    let gradientSum = 0
    for (const point of batch) {
      const originalOutput = forwardPass([point.x, point.y], clonedNeurons, clonedConnections)
      const originalLoss = -(point.label * Math.log(Math.max(originalOutput, 1e-7)) +
        (1 - point.label) * Math.log(Math.max(1 - originalOutput, 1e-7)))
      totalLoss += originalLoss

      conn.weight += epsilon
      const perturbedOutput = forwardPass([point.x, point.y], clonedNeurons, clonedConnections)
      const perturbedLoss = -(point.label * Math.log(Math.max(perturbedOutput, 1e-7)) +
        (1 - point.label) * Math.log(Math.max(1 - perturbedOutput, 1e-7)))
      conn.weight -= epsilon

      gradientSum += (perturbedLoss - originalLoss) / epsilon
    }
    conn.weight -= learningRate * (gradientSum / batchSize)
    conn.weight = Math.max(-5, Math.min(5, conn.weight))
  }

  // Update biases
  for (const neuron of clonedNeurons) {
    if (neuron.layer === 0) continue
    let gradientSum = 0
    for (const point of batch) {
      const originalOutput = forwardPass([point.x, point.y], clonedNeurons, clonedConnections)
      const originalLoss = -(point.label * Math.log(Math.max(originalOutput, 1e-7)) +
        (1 - point.label) * Math.log(Math.max(1 - originalOutput, 1e-7)))

      neuron.bias += epsilon
      const perturbedOutput = forwardPass([point.x, point.y], clonedNeurons, clonedConnections)
      const perturbedLoss = -(point.label * Math.log(Math.max(perturbedOutput, 1e-7)) +
        (1 - point.label) * Math.log(Math.max(1 - perturbedOutput, 1e-7)))
      neuron.bias -= epsilon

      gradientSum += (perturbedLoss - originalLoss) / epsilon
    }
    neuron.bias -= learningRate * (gradientSum / batchSize)
    neuron.bias = Math.max(-3, Math.min(3, neuron.bias))
  }

  // Final forward pass to update activations
  if (batch.length > 0) {
    forwardPass([batch[0].x, batch[0].y], clonedNeurons, clonedConnections)
  }

  return {
    neurons: clonedNeurons,
    connections: clonedConnections,
    loss: totalLoss / (batchSize * clonedConnections.length),
  }
}
