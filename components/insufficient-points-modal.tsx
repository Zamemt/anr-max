"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Gift } from "lucide-react"

interface InsufficientPointsModalProps {
  show: boolean
  currentPoints: number
  requiredPoints: number
  canClaimDaily: boolean
  onClose: () => void
  onClaimDaily: () => Promise<void>
}

export function InsufficientPointsModal({
  show,
  currentPoints,
  requiredPoints,
  canClaimDaily,
  onClose,
  onClaimDaily,
}: InsufficientPointsModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Not Enough Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              You need <strong>{requiredPoints} points</strong> to play, but you only have{" "}
              <strong>{currentPoints} points</strong>.
            </p>
          </div>

          <div className="space-y-3">
            {canClaimDaily && (
              <Button
                onClick={async () => {
                  await onClaimDaily()
                  onClose()
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Gift className="h-4 w-4 mr-2" />
                Claim Daily +100 Points
              </Button>
            )}

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">💡 How to get more points:</div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Daily check-in: +100 points (every 24h)</li>
                <li>• Win matches: +100 points per win</li>
                <li>• New user bonus: 1,000 points</li>
              </ul>
            </div>

            <Button onClick={onClose} variant="outline" className="w-full">
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
