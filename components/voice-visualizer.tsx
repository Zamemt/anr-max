"use client"

import { useEffect, useState } from "react"

interface VoiceVisualizerProps {
  isListening: boolean
  confidence: number
}

export function VoiceVisualizer({ isListening, confidence }: VoiceVisualizerProps) {
  const [bars, setBars] = useState<number[]>(new Array(5).fill(0))

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setBars((prev) => prev.map(() => Math.random() * 100))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setBars(new Array(5).fill(0))
    }
  }, [isListening])

  return (
    <div className="flex items-end justify-center space-x-1 h-12">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-2 bg-gradient-to-t transition-all duration-100 rounded-full ${
            isListening ? "from-green-400 to-green-600" : "from-gray-300 to-gray-400"
          }`}
          style={{ height: `${Math.max(4, height * 0.4)}px` }}
        />
      ))}
      {confidence > 0 && (
        <div className="ml-4 text-xs text-green-600 font-medium">{Math.round(confidence * 100)}% confident</div>
      )}
    </div>
  )
}
