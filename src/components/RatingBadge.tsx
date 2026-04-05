import { Star } from 'lucide-react'

interface RatingBadgeProps {
  rating: number
  size?: 'sm' | 'md'
}

function getRatingColor(rating: number) {
  if (rating >= 7) return 'text-success'
  if (rating >= 5) return 'text-warning'
  return 'text-error'
}

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  if (rating <= 0) return null

  const color = getRatingColor(rating)
  const iconSize = size === 'sm' ? 12 : 14
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="inline-flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
      <Star size={iconSize} className={`${color} fill-current`} />
      <span className={`${textSize} font-semibold ${color}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
