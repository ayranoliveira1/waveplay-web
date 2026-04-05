import { useMemo } from 'react'
import { useAuth } from './useAuth'

type SubscriptionReason = 'active' | 'no-plan' | 'expired'

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  reason: SubscriptionReason
}

export function useSubscription(): SubscriptionStatus {
  const { user } = useAuth()

  return useMemo(() => {
    const subscription = user?.subscription

    if (!subscription) {
      return { hasActiveSubscription: false, reason: 'no-plan' }
    }

    if (subscription.endsAt && new Date(subscription.endsAt) < new Date()) {
      return { hasActiveSubscription: false, reason: 'expired' }
    }

    return { hasActiveSubscription: true, reason: 'active' }
  }, [user?.subscription])
}
