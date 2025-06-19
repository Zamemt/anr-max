"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Home, Play, Trophy, Settings, Mic, MicOff, Zap, Shield, Clock, Crown, Medal, ArrowLeft } from "lucide-react"

type Screen = "home" | "gameplay" | "result" | "leaderboard"

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
]

const leaderboardData = [
  { rank: 1, name: "Alex", score: 2450, avatar: "A" },
  { rank: 2, name: "Sarah", score: 2380, avatar: "S" },
  { rank: 3, name: "Mike", score: 2290, avatar: "M" },
  { rank: 4, name: "Emma", score: 2150, avatar: "E" },
  { rank: 5, name: "You", score: 1980, avatar: "Y" },
]

export default function Component() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [isRecording, setIsRecording] = useState(false)
  const [gameTimer, setGameTimer] = useState(30)
  const [currentAnimal, setCurrentAnimal] = useState("Lion")
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)

  // Game timer effect
  useEffect(() => {
    if (currentScreen === "gameplay" && gameTimer > 0) {
      const timer = setTimeout(() => setGameTimer(gameTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameTimer === 0 && currentScreen === "gameplay") {
      // Game ends
      const result = playerScore > opponentScore ? "win" : "lose"
      setGameResult(result)
      setCurrentScreen("result")
    }
  }, [gameTimer, currentScreen, playerScore, opponentScore])

  const startGame = () => {
    setCurrentScreen("gameplay")
    setGameTimer(30)
    setPlayerScore(0)
    setOpponentScore(0)
    setCurrentAnimal(animalNames[Math.floor(Math.random() * animalNames.length)])
  }

  const useSkill = (skillType: string) => {
    console.log(`Used skill: ${skillType}`)
    // Simulate skill effect
    if (skillType === "boost") {
      setPlayerScore((prev) => prev + 50)
    }
  }

  useEffect(() => {
    if (isRecording) {
      // Simulate getting a point
      const timeoutId = setTimeout(() => {
        setPlayerScore((prev) => prev + 100)
        setOpponentScore((prev) => prev + Math.floor(Math.random() * 80))
        setCurrentAnimal(animalNames[Math.floor(Math.random() * animalNames.length)])
        setIsRecording(false)
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [isRecording])

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 p-4 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">🦁</div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Animal Name Race</h1>
          <p className="text-white/90 text-lg">Voice-powered 1v1 animal naming challenge!</p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Button
            onClick={startGame}
            className="w-full h-14 text-lg font-semibold bg-white text-purple-600 hover:bg-gray-100"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Game
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
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="ghost" size="icon" className="text-white">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white">
          <Home className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  const GameplayScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("home")} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="font-bold text-lg">{gameTimer}s</span>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{playerScore}</div>
              <div className="text-sm text-gray-600">You</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{opponentScore}</div>
              <div className="text-sm text-gray-600">Opponent</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Animal */}
        <Card className="bg-white/95">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Current Category</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl">🐾</div>
            <div className="text-2xl font-bold text-purple-600">{currentAnimal}</div>
            <Badge variant="secondary" className="text-sm">
              Name animals starting with this!
            </Badge>
          </CardContent>
        </Card>

        {/* Voice Recording */}
        <Card className="bg-white/95">
          <CardContent className="p-6 text-center space-y-4">
            <Button
              onClick={toggleRecording}
              size="lg"
              className={`w-24 h-24 rounded-full ${
                isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            <p className="text-sm text-gray-600">{isRecording ? "Recording... Speak now!" : "Tap to speak"}</p>
          </CardContent>
        </Card>

        {/* Skills */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => useSkill("boost")} className="h-12 bg-yellow-500 hover:bg-yellow-600">
            <Zap className="mr-2 h-4 w-4" />
            Speed Boost
          </Button>
          <Button onClick={() => useSkill("shield")} className="h-12 bg-purple-500 hover:bg-purple-600">
            <Shield className="mr-2 h-4 w-4" />
            Shield
          </Button>
        </div>
      </div>
    </div>
  )

  const ResultScreen = () => (
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
            <h2 className="text-3xl font-bold mb-2">{gameResult === "win" ? "You Win!" : "You Lose!"}</h2>
            <p className="text-gray-600">
              {gameResult === "win" ? "Great job naming those animals!" : "Better luck next time!"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Your Score</span>
              <span className="font-bold text-green-600">{playerScore}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Opponent Score</span>
              <span className="font-bold text-red-500">{opponentScore}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={startGame} className="w-full h-12 bg-purple-600 hover:bg-purple-700">
              Play Again
            </Button>
            <Button onClick={() => setCurrentScreen("home")} variant="outline" className="w-full h-12">
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const LeaderboardScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-500 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("home")} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <div className="w-10" />
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboardData.map((player, index) => (
            <Card
              key={player.rank}
              className={`${player.name === "You" ? "bg-yellow-100 border-yellow-300" : "bg-white/95"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {player.rank === 1 && <Crown className="h-6 w-6 text-yellow-500" />}
                    {player.rank === 2 && <Medal className="h-6 w-6 text-gray-400" />}
                    {player.rank === 3 && <Medal className="h-6 w-6 text-orange-500" />}
                    {player.rank > 3 && <span className="text-lg font-bold text-gray-500">{player.rank}</span>}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-200 text-purple-700">{player.avatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.score} points</div>
                  </div>

                  {player.name === "You" && <Badge variant="secondary">You</Badge>}
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

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {currentScreen === "home" && <HomeScreen />}
      {currentScreen === "gameplay" && <GameplayScreen />}
      {currentScreen === "result" && <ResultScreen />}
      {currentScreen === "leaderboard" && <LeaderboardScreen />}
    </div>
  )
}
