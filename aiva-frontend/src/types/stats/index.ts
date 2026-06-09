export interface DashboardStats {
  totalTracks: number
  creditsRemaining: number
  totalPlays: number
  libraryCount: number
  weeklyChange: {
    tracks: number
    plays: number
  }
}
