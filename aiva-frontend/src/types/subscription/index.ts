export type PlanType = 'free' | 'pro' | 'enterprise'

export interface Plan {
  id: string
  name: string
  price: { monthly: number; yearly: number }
  credits: number
  features: string[]
  limits: { wav: boolean; stems: boolean; commercial: boolean }
}

export interface CurrentSubscription {
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}
