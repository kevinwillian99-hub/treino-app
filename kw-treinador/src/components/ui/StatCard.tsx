import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

export function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              trendUp ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trend}
          </p>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
        <Icon className="h-5 w-5 text-gold" />
      </div>
    </Card>
  )
}
