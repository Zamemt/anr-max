"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, VolumeX, SkipForward, Clock } from "lucide-react"

interface SkillCardProps {
  skill: {
    id: string
    name: string
    description: string
    cost: number
    cooldown: number
    icon: string
  }
  onUse: (skillId: string) => void
  disabled?: boolean
  tokens: number
}

const iconMap = {
  skip: SkipForward,
  mute: VolumeX,
  reduce: Clock,
  boost: Zap,
}

export function SkillCard({ skill, onUse, disabled, tokens }: SkillCardProps) {
  const IconComponent = iconMap[skill.icon as keyof typeof iconMap] || Zap
  const canAfford = tokens >= skill.cost

  return (
    <Card className={`transition-all ${!canAfford || disabled ? "opacity-50" : "hover:shadow-md"}`}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <IconComponent className="h-4 w-4 text-purple-600" />
          <span className="font-semibold text-sm">{skill.name}</span>
          <Badge variant="secondary" className="text-xs">
            {skill.cost}🪙
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mb-3">{skill.description}</p>
        <Button
          onClick={() => onUse(skill.id)}
          disabled={!canAfford || disabled}
          size="sm"
          className="w-full h-8 text-xs"
        >
          Use Skill
        </Button>
      </CardContent>
    </Card>
  )
}
