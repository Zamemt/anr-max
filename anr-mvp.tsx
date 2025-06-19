"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Home, Play, Trophy, Mic, MicOff, ArrowLeft, Users, Timer, Crown, Sparkles, Settings } from "lucide-react"
import { useVoiceRecognition } from "./hooks/use-voice-recognition"
import { SkillCard } from "./components/skill-card"
import { VoiceVisualizer } from "./components/voice-visualizer"
import { PointsDisplay } from "./components/points-display"
import { PointsAnimation } from "./components/points-animation"
import { InsufficientPointsModal } from "./components/insufficient-points-modal"
import { getUserProfile, claimDailyPoints, recordGameResult, adminAdjustPoints, type UserProfile } from "./lib/database"
import { ToastNotification } from "./components/toast-notification"

type Screen = "home" | "matchmaking" | "gameplay" | "result" | "leaderboard" | "admin"

const animalNames = [
  "Lion",
  "Tiger",
  "Elephant",
  "Giraffe",
  "Zebra",
  "Monkey",
  "Panda",
  "Kangaroo",
  "Dolphin",
  "Eagle",
  "Penguin",
  "Butterfly",
  "Octopus",
  "Bear",
  "Wolf",
  "Fox",
]

const skillCards = [
  {
    id: "skip",
    name: "Skip Turn",
    description: "Skip opponent's turn",
    cost: 150,
    cooldown: 3,
    icon: "skip",
  },
  {
    id: "mute",
    name: "Mute 3s",
    description: "Mute opponent for 3 seconds",
    cost: 200,
    cooldown: 5,
    icon: "mute",
  },
  {
    id: "reduce",
    name: "Reduce Word",
    description: "Remove last animal from chain",
    cost: 250,
    cooldown: 4,
    icon: "reduce",
  },
]

export default function ANRGame() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [gameTimer, setGameTimer] = useState(15)
  const [currentPlayer, setCurrentPlayer] = useState<"player" | "opponent">("player")
  const [animalChain, setAnimalChain] = useState<string[]>(["Lion"])
  const [round, setRound] = useState(1)
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({})
  const [opponentMuted, setOpponentMuted] = useState(false)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [pointsAnimation, setPointsAnimation] = useState({ points: 0, reason: "" })
  const [showInsufficientPoints, setShowInsufficientPoints] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [showToast, setShowToast] = useState(false)
  const [toastData, setToastData] = useState({ points: 0, message: "" })

  const { isListening, transcript, confidence, startListening, stopListening, clearTranscript } = useVoiceRecognition()

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile("demo-user")
      setUserProfile(profile)
    } catch (error) {
      console.error("Failed to load user profile:", error)
    }
  }

  const canClaimDaily = () => {
    if (!userProfile?.lastDailyClaimAt) return true
    const lastClaim = new Date(userProfile.lastDailyClaimAt)
    const now = new Date()
    return now.getTime() - lastClaim.getTime() >= 24 * 60 * 60 * 1000
  }

  const handleClaimDaily = async () => {
    if (!userProfile) return

    setIsLoading(true)
    try {
      const result = await claimDailyPoints(userProfile.id)
      if (result.success && result.user) {
        setUserProfile(result.user)
        showPointsAnimationWithDelay(100, "Daily check-in bonus!")
      }
    } catch (error) {
      console.error("Failed to claim daily points:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const showPointsAnimationWithDelay = (points: number, reason: string) => {
    // Show both the existing animation and the new toast
    setPointsAnimation({ points, reason })
    setShowPointsAnimation(true)

    // Show toast notification
    setToastData({ points, message: reason })
    setShowToast(true)
  }

  const canAffordGame = () => {
    return userProfile && userProfile.anrPoints >= 50
  }

  // Game timer effect
  useEffect(() => {
    if (currentScreen === "gameplay" && gameTimer > 0) {
      const timer = setTimeout(() => setGameTimer(gameTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameTimer === 0 && currentScreen === "gameplay") {
      // Current player loses their turn
      const won = currentPlayer === "opponent"
      endGame(won)
    }
  }, [gameTimer, currentScreen, currentPlayer])

  const endGame = async (won: boolean) => {
    if (!userProfile) return

    setGameResult(won ? "win" : "lose")

    try {
      const updatedProfile = await recordGameResult(userProfile.id, won)
      if (updatedProfile) {
        setUserProfile(updatedProfile)
      }
    } catch (error) {
      console.error("Failed to record game result:", error)
    }

    setCurrentScreen("result")
  }

  // Handle successful voice input
  useEffect(() => {
    if (transcript && confidence > 0.7) {
      const words = transcript.toLowerCase().split(" ")
      const lastAnimal = animalChain[animalChain.length - 1].toLowerCase()

      // Check if player said the previous animal + new animal
      if (words.length >= 2 && words[0] === lastAnimal) {
        const newAnimal = words[1]
        setAnimalChain((prev) => [...prev, newAnimal.charAt(0).toUpperCase() + newAnimal.slice(1)])

        // Switch to opponent
        setCurrentPlayer("opponent")
        setGameTimer(15)
        clearTranscript()

        // Simulate opponent turn
        setTimeout(() => {
          if (!opponentMuted) {
            simulateOpponentTurn()
          } else {
            // Opponent is muted, player gets another turn
            setCurrentPlayer("player")
            setOpponentMuted(false)
          }
        }, 2000)
      }
    }
  }, [transcript, confidence, animalChain, opponentMuted])

  const simulateOpponentTurn = () => {
    const animals = ["Tiger", "Elephant", "Giraffe", "Zebra", "Monkey", "Panda", "Eagle"]
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)]

    // 70% chance opponent succeeds
    if (Math.random() > 0.3) {
      setAnimalChain((prev) => [...prev, randomAnimal])
      setCurrentPlayer("player")
      setGameTimer(15)
    } else {
      // Opponent fails
      endGame(true)
    }
  }

  const startGame = () => {
    if (!canAffordGame()) {
      setShowInsufficientPoints(true)
      return
    }

    setCurrentScreen("matchmaking")
    setTimeout(() => {
      setCurrentScreen("gameplay")
      setGameTimer(15)
      setAnimalChain(["Lion"])
      setCurrentPlayer("player")
      setRound(1)
      setSkillCooldowns({})
      setOpponentMuted(false)

      // Deduct game cost
      showPointsAnimationWithDelay(-50, "Game entry fee")
    }, 2000)
  }

  const useSkill = useCallback(
    async (skillId: string) => {
      const skill = skillCards.find((s) => s.id === skillId)
      if (!skill || !userProfile || userProfile.anrPoints < skill.cost || skillCooldowns[skillId] > 0) return

      try {
        const updatedProfile = await adminAdjustPoints(
          userProfile.id,
          userProfile.anrPoints - skill.cost,
          `Used skill: ${skill.name}`,
        )
        if (updatedProfile) {
          setUserProfile(updatedProfile)
          showPointsAnimationWithDelay(-skill.cost, `Used ${skill.name}`)
        }
      } catch (error) {
        console.error("Failed to use skill:", error)
        return
      }

      setSkillCooldowns((prev) => ({ ...prev, [skillId]: skill.cooldown }))

      switch (skillId) {
        case "skip":
          if (currentPlayer === "opponent") {
            setCurrentPlayer("player")
            setGameTimer(15)
          }
          break
        case "mute":
          setOpponentMuted(true)
          break
        case "reduce":
          if (animalChain.length > 1) {
            setAnimalChain((prev) => prev.slice(0, -1))
          }
          break
      }
    },
    [userProfile, skillCooldowns, currentPlayer, animalChain],
  )

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillCooldowns((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) updated[key]--
        })
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <div className="text-7xl">🦁</div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">ANR</h1>
          <h2 className="text-2xl font-semibold text-white/90">Animal Name Race</h2>
          <p className="text-white/80 text-lg max-w-sm">
            Voice-powered 1v1 memory game. Say the chain, add your animal!
          </p>
        </div>

        {userProfile && (
          <PointsDisplay
            points={userProfile.anrPoints}
            canClaimDaily={canClaimDaily()}
            onClaimDaily={handleClaimDaily}
            isLoading={isLoading}
          />
        )}

        <div className="space-y-4 w-full max-w-sm">
          <Button
            onClick={startGame}
            className={`w-full h-14 text-lg font-semibold ${
              canAffordGame()
                ? "bg-white text-purple-600 hover:bg-gray-100"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!canAffordGame()}
          >
            <Play className="mr-2 h-5 w-5" />
            {canAffordGame() ? "Start Game (50 points)" : "Not Enough Points"}
          </Button>

          <Button
            onClick={() => setCurrentScreen("leaderboard")}
            variant="outline"
            className="w-full h-12 text-white border-white hover:bg-white/10"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </div>

        <div className="text-center text-white/60 text-sm space-y-1">
          <p>🌍 Powered by World ID</p>
          <p>Speak fast • Memory • Strategy</p>
          {userProfile && (
            <p className="text-xs">
              Games: {userProfile.totalGamesPlayed} | Wins: {userProfile.totalWins}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="icon" className="text-white" onClick={() => setCurrentScreen("admin")}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  const MatchmakingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-sm bg-white/95">
        <CardContent className="p-8 text-center space-y-6">
          <div className="animate-spin text-4xl">🔍</div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
            <p className="text-gray-600">Matching you with a player of similar skill</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm">47 players online</span>
            </div>
            <Progress value={75} className="w-full" />
          </div>
          <div className="text-xs text-gray-500">Entry fee: 50 points deducted</div>
        </CardContent>
      </Card>
    </div>
  )

  const GameplayScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("home")} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="text-sm opacity-80">Round {round}</div>
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4" />
              <span className="font-bold text-xl">{gameTimer}s</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="opacity-80">Your Points</div>
            <div className="font-bold">{userProfile?.anrPoints || 0}</div>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={`${currentPlayer === "player" ? "ring-2 ring-yellow-400" : ""} bg-white/90`}>
            <CardContent className="p-4 text-center">
              <Avatar className="h-12 w-12 mx-auto mb-2">
                <AvatarFallback className="bg-blue-200">You</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">You</div>
              <div className="text-xs text-gray-600">{userProfile?.anrPoints || 0} pts</div>
            </CardContent>
          </Card>
          <Card className={`${currentPlayer === "opponent" ? "ring-2 ring-red-400" : ""} bg-white/90`}>
            <CardContent className="p-4 text-center">
              <Avatar className="h-12 w-12 mx-auto mb-2">
                <AvatarFallback className="bg-red-200">AI</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">Opponent</div>
              <div className="text-xs text-gray-600">AI Player</div>
              {opponentMuted && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Muted
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Animal Chain */}
        <Card className="bg-white/95">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Animal Chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {animalChain.map((animal, index) => (
                <Badge
                  key={index}
                  variant={index === animalChain.length - 1 ? "default" : "secondary"}
                  className="text-sm"
                >
                  {animal}
                </Badge>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Say: "<strong>{animalChain[animalChain.length - 1]} + [New Animal]</strong>"
            </div>
          </CardContent>
        </Card>

        {/* Voice Input */}
        {currentPlayer === "player" && (
          <Card className="bg-white/95">
            <CardContent className="p-6 text-center space-y-4">
              <VoiceVisualizer isListening={isListening} confidence={confidence} />

              <Button
                onClick={isListening ? stopListening : startListening}
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">{isListening ? "Listening... Speak now!" : "Tap to speak"}</p>
                {transcript && (
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">"{transcript}"</p>
                    <p className="text-xs text-green-600">Confidence: {Math.round(confidence * 100)}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opponent Turn */}
        {currentPlayer === "opponent" && (
          <Card className="bg-white/95">
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-4xl">🤖</div>
              <div>
                <p className="font-medium">Opponent's Turn</p>
                <p className="text-sm text-gray-600">{opponentMuted ? "Opponent is muted!" : "Thinking..."}</p>
              </div>
              {!opponentMuted && (
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skill Cards */}
        <div className="grid grid-cols-3 gap-2">
          {skillCards.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onUse={useSkill}
              disabled={skillCooldowns[skill.id] > 0 || currentPlayer !== "player"}
              tokens={userProfile?.anrPoints || 0}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const ResultScreen = () => {
    const pointsChange = gameResult === "win" ? 100 : 0 // Win gives +100, lose gives 0 (already paid entry fee)

    return (
      <div
        className={`min-h-screen p-4 flex flex-col items-center justify-center ${
          gameResult === "win"
            ? "bg-gradient-to-br from-green-400 to-emerald-500"
            : "bg-gradient-to-br from-red-400 to-pink-500"
        }`}
      >
        <Card className="w-full max-w-sm bg-white/95">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl">{gameResult === "win" ? "🏆" : "😔"}</div>

            <div>
              <h2 className="text-3xl font-bold mb-2">{gameResult === "win" ? "Victory!" : "Defeat!"}</h2>
              <p className="text-gray-600">
                {gameResult === "win" ? "Amazing memory and voice skills!" : "Great effort! Practice makes perfect."}
              </p>
            </div>

            <div className="space-y-3">
              <div
                className={`p-4 rounded-lg ${
                  gameResult === "win"
                    ? "bg-gradient-to-r from-green-100 to-emerald-200"
                    : "bg-gradient-to-r from-red-100 to-pink-200"
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">{gameResult === "win" ? "🎉" : "💸"}</span>
                  <span className="font-bold text-lg">{gameResult === "win" ? `+${pointsChange}` : "0"} Points</span>
                </div>
                <p className="text-xs">{gameResult === "win" ? "Winner bonus!" : "Entry fee: -50 points"}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Final Chain ({animalChain.length} animals):</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {animalChain.map((animal, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {animal}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Current Balance: <strong>{userProfile?.anrPoints || 0} points</strong>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                disabled={!canAffordGame()}
              >
                <Play className="mr-2 h-4 w-4" />
                {canAffordGame() ? "Play Again (50 pts)" : "Not Enough Points"}
              </Button>
              <Button onClick={() => setCurrentScreen("home")} variant="outline" className="w-full h-12">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const LeaderboardScreen = () => {
    const leaderboardData = [
      { rank: 1, name: "VoiceMaster", points: 4250, avatar: "VM", streak: 12 },
      { rank: 2, name: "AnimalKing", points: 3880, avatar: "AK", streak: 8 },
      { rank: 3, name: "ChainBreaker", points: 3290, avatar: "CB", streak: 5 },
      { rank: 4, name: "SpeechWiz", points: 2650, avatar: "SW", streak: 3 },
      { rank: 5, name: "You", points: userProfile?.anrPoints || 0, avatar: "Y", streak: 2 },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between text-white mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("home")} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Global Leaderboard</h1>
            <div className="w-10" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm opacity-80">Active Players</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">125K</div>
                <div className="text-sm opacity-80">Points in Play</div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            {leaderboardData.map((player) => (
              <Card
                key={player.rank}
                className={`${player.name === "You" ? "bg-yellow-100 border-yellow-300" : "bg-white/95"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {player.rank === 1 && <Crown className="h-6 w-6 text-yellow-500" />}
                      {player.rank > 1 && <span className="text-lg font-bold text-gray-500">{player.rank}</span>}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-200 text-purple-700">{player.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-2">
                        <span>{player.points.toLocaleString()} pts</span>
                        <span>•</span>
                        <span>{player.streak} win streak</span>
                      </div>
                    </div>

                    {player.name === "You" && <Badge variant="secondary">You</Badge>}
                    {player.rank <= 3 && player.name !== "You" && <Sparkles className="h-4 w-4 text-yellow-500" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => setCurrentScreen("home")}
            className="w-full h-12 mt-6 bg-white text-purple-600 hover:bg-gray-100"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const AdminScreen = () => {
    const [adminPoints, setAdminPoints] = useState(userProfile?.anrPoints || 0)

    const handleAdminAdjust = async () => {
      if (!userProfile) return

      try {
        const updatedProfile = await adminAdjustPoints(userProfile.id, adminPoints, "Admin adjustment")
        if (updatedProfile) {
          setUserProfile(updatedProfile)
          showPointsAnimationWithDelay(adminPoints - userProfile.anrPoints, "Admin adjustment")
        }
      } catch (error) {
        console.error("Failed to adjust points:", error)
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-white mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("home")} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="w-10" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Profile Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile && (
                <div className="space-y-2">
                  <p>
                    <strong>User:</strong> {userProfile.username}
                  </p>
                  <p>
                    <strong>Current Points:</strong> {userProfile.anrPoints}
                  </p>
                  <p>
                    <strong>Games Played:</strong> {userProfile.totalGamesPlayed}
                  </p>
                  <p>
                    <strong>Wins:</strong> {userProfile.totalWins}
                  </p>
                  <p>
                    <strong>Last Daily Claim:</strong>{" "}
                    {userProfile.lastDailyClaimAt ? new Date(userProfile.lastDailyClaimAt).toLocaleString() : "Never"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Adjust Points:</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={adminPoints}
                    onChange={(e) => setAdminPoints(Number.parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="New point balance"
                  />
                  <Button onClick={handleAdminAdjust}>Set Points</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setAdminPoints((prev) => prev + 100)} variant="outline">
                  +100 Points
                </Button>
                <Button onClick={() => setAdminPoints((prev) => Math.max(0, prev - 100))} variant="outline">
                  -100 Points
                </Button>
                <Button onClick={() => setAdminPoints(1000)} variant="outline">
                  Reset to 1000
                </Button>
                <Button onClick={() => setAdminPoints(0)} variant="outline">
                  Set to 0
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {currentScreen === "home" && <HomeScreen />}
      {currentScreen === "matchmaking" && <MatchmakingScreen />}
      {currentScreen === "gameplay" && <GameplayScreen />}
      {currentScreen === "result" && <ResultScreen />}
      {currentScreen === "leaderboard" && <LeaderboardScreen />}
      {currentScreen === "admin" && <AdminScreen />}

      <PointsAnimation
        show={showPointsAnimation}
        points={pointsAnimation.points}
        reason={pointsAnimation.reason}
        onComplete={() => setShowPointsAnimation(false)}
      />

      <InsufficientPointsModal
        show={showInsufficientPoints}
        currentPoints={userProfile?.anrPoints || 0}
        requiredPoints={50}
        canClaimDaily={canClaimDaily()}
        onClose={() => setShowInsufficientPoints(false)}
        onClaimDaily={handleClaimDaily}
      />
      <ToastNotification
        show={showToast}
        points={toastData.points}
        message={toastData.message}
        onComplete={() => setShowToast(false)}
        position="top"
      />
    </div>
  )
}
