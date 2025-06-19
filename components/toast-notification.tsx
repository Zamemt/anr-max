"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, MinusCircle, Plus, Minus } from "lucide-react"

interface ToastNotificationProps {
  show: boolean
  points: number
  message: string
  onComplete: () => void
  position?: "top" | "bottom"
}

export function ToastNotification({ show, points, message, onComplete, position = "top" }: ToastNotificationProps) {
  const [visible, setVisible] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      // Start animation after a brief delay
      setTimeout(() => setAnimate(true), 50)

      // Hide after 2 seconds
      const timer = setTimeout(() => {
        setAnimate(false)
        setTimeout(() => {
          setVisible(false)
          onComplete()
        }, 300) // Wait for fade out animation
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  const isPositive = points > 0
  const positionClasses = position === "top" ? "top-4" : "bottom-4"

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 ${positionClasses} z-50 transition-all duration-300 ${
        animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <Card
        className={`shadow-lg border-2 ${isPositive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <CardContent className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className={`p-1 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
              {isPositive ? <Plus className="h-4 w-4 text-green-600" /> : <Minus className="h-4 w-4 text-red-600" />}
            </div>

            <div className="flex items-center space-x-2">
              <span className={`font-bold text-lg ${isPositive ? "text-green-700" : "text-red-700"}`}>
                {isPositive ? "+" : ""}
                {points}
              </span>
              <span className="text-sm text-gray-600">points</span>
            </div>

            <div className={`p-1 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
              {isPositive ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <MinusCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center mt-1">{message}</div>
        </CardContent>
      </Card>
    </div>
  )
}
