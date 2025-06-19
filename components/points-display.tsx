"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, Gift, Clock, Sparkles } from "lucide-react"

interface PointsDisplayProps {
  points: number
  canClaimDaily: boolean
  onClaimDaily: () => Promise<void>
  isLoading?: boolean
}

export function PointsDisplay({ points, canClaimDaily, onClaimDaily, isLoading }: PointsDisplayProps) {
  const [animatingPoints, setAnimatingPoints] = useState(points)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (points !== animatingPoints) {
      setShowAnimation(true)
      const timer = setTimeout(() => {
        setAnimatingPoints(points)
        setTimeout(() => setShowAnimation(false), 500)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [points, animatingPoints])

  return (
    <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Coins className="h-8 w-8 text-yellow-600" />
              {showAnimation && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
              )}
            </div>
            <div>
              <div className={`text-2xl font-bold text-yellow-800 transition-all ${showAnimation ? "scale-110" : ""}`}>
                {animatingPoints.toLocaleString()}
              </div>
              <div className="text-sm text-yellow-700">ANR Points</div>
            </div>
          </div>

          {canClaimDaily && (
            <Button
              onClick={onClaimDaily}
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Gift className="h-4 w-4 mr-1" />
              {isLoading ? "..." : "Claim +100"}
            </Button>
          )}

          {!canClaimDaily && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Daily claimed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
