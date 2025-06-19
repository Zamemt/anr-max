"use client"

import { useState, useCallback } from "react"

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)

  const startListening = useCallback(() => {
    setIsListening(true)
    // Simulate voice recognition for demo
    setTimeout(
      () => {
        const animals = ["Lion Tiger", "Tiger Elephant", "Elephant Giraffe", "Giraffe Zebra"]
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
        setTranscript(randomAnimal)
        setConfidence(0.85 + Math.random() * 0.15)
        setIsListening(false)
      },
      2000 + Math.random() * 1000,
    )
  }, [])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript("")
    setConfidence(0)
  }, [])

  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    clearTranscript,
  }
}
