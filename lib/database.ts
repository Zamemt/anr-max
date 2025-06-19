"use server"

// Simulated database operations for the demo
// In production, this would connect to your actual database (Supabase, etc.)

export interface UserProfile {
  id: string
  worldId: string
  username: string
  anrPoints: number
  lastDailyClaimAt: string | null
  totalGamesPlayed: number
  totalWins: number
  createdAt: string
  updatedAt: string
}

// Simulated user database
const users: Map<string, UserProfile> = new Map()

// Initialize with some demo users
users.set("demo-user", {
  id: "demo-user",
  worldId: "world_demo_123",
  username: "You",
  anrPoints: 850,
  lastDailyClaimAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
  totalGamesPlayed: 12,
  totalWins: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate DB delay
  return users.get(userId) || null
}

export async function createUserProfile(worldId: string, username: string): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const userId = `user_${Date.now()}`
  const newUser: UserProfile = {
    id: userId,
    worldId,
    username,
    anrPoints: 1000, // Initial 1,000 points
    lastDailyClaimAt: null,
    totalGamesPlayed: 0,
    totalWins: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.set(userId, newUser)
  return newUser
}

export async function updateUserPoints(
  userId: string,
  pointsChange: number,
  reason: string,
): Promise<UserProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const user = users.get(userId)
  if (!user) return null

  const updatedUser = {
    ...user,
    anrPoints: Math.max(0, user.anrPoints + pointsChange),
    updatedAt: new Date().toISOString(),
  }

  users.set(userId, updatedUser)
  console.log(`Points updated for ${user.username}: ${pointsChange} (${reason})`)
  return updatedUser
}

export async function claimDailyPoints(
  userId: string,
): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const user = users.get(userId)
  if (!user) return { success: false, message: "User not found" }

  const now = new Date()
  const lastClaim = user.lastDailyClaimAt ? new Date(user.lastDailyClaimAt) : null

  // Check if 24 hours have passed
  if (lastClaim && now.getTime() - lastClaim.getTime() < 24 * 60 * 60 * 1000) {
    const timeLeft = 24 * 60 * 60 * 1000 - (now.getTime() - lastClaim.getTime())
    const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000))
    return {
      success: false,
      message: `Daily claim available in ${hoursLeft} hours`,
    }
  }

  const updatedUser = {
    ...user,
    anrPoints: user.anrPoints + 100,
    lastDailyClaimAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  users.set(userId, updatedUser)
  return {
    success: true,
    user: updatedUser,
    message: "Daily points claimed successfully!",
  }
}

export async function recordGameResult(userId: string, won: boolean): Promise<UserProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const user = users.get(userId)
  if (!user) return null

  const pointsChange = won ? 50 : -50 // Win: +50 net (100 - 50 cost), Lose: -50 (cost only)

  const updatedUser = {
    ...user,
    anrPoints: Math.max(0, user.anrPoints + pointsChange),
    totalGamesPlayed: user.totalGamesPlayed + 1,
    totalWins: won ? user.totalWins + 1 : user.totalWins,
    updatedAt: new Date().toISOString(),
  }

  users.set(userId, updatedUser)
  return updatedUser
}

// Admin function for testing
export async function adminAdjustPoints(
  userId: string,
  newPoints: number,
  reason: string,
): Promise<UserProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const user = users.get(userId)
  if (!user) return null

  const updatedUser = {
    ...user,
    anrPoints: Math.max(0, newPoints),
    updatedAt: new Date().toISOString(),
  }

  users.set(userId, updatedUser)
  console.log(`Admin adjusted points for ${user.username}: ${newPoints} (${reason})`)
  return updatedUser
}
