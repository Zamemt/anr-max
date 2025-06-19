"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface PointsAnimationProps {
  show: boolean
  points: number
  reason: string
  onComplete: () => void
}

export function PointsAnimation({ show, points, reason, onComplete }: PointsAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onComplete, 300)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show && !visible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/20" />
      <Card
        className={`relative transform transition-all duration-500 ${
          visible ? "scale-100 translate-y-0" : "scale-75 translate-y-4"
        }`}
      >
        <CardContent className="p-6 text-center">
          <div className={`text-4xl mb-2 ${points > 0 ? "text-green-600" : "text-red-600"}`}>
            {points > 0 ? "+" : ""}
            {points}
          </div>
          <div className="text-lg font-semibold mb-1">
            {points > 0 ? "🎉" : "💸"} Points {points > 0 ? "Earned" : "Spent"}
          </div>
          <div className="text-sm text-gray-600">{reason}</div>
        </CardContent>
      </Card>
    </div>
  )
}
