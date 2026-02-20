'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, ShieldCheck, ShieldX, Ban, Clock, Key, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface KeySummaryData {
  all_keys: number
  all_secret: number
  all_msk: number
  active: number
  expiring_soon: number
  inactive: number
  revoked: number
  isUsingMockData?: boolean
}

export function KeyInventoryStats() {
  const [data, setData] = useState<KeySummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKeySummary = async () => {
      try {
        setLoading(true)
        console.log('[v0] Fetching key summary from: /api/key-summary')

        const response = await fetch('/api/key-summary')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json() as KeySummaryData
        console.log('[v0] Key summary data fetched successfully:', responseData)
        setData(responseData)
        setError(null)
      } catch (err) {
        console.error('[v0] Failed to fetch key summary:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchKeySummary()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="border-border/30 bg-card/50 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-full mb-4" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-border/30">
        <CardContent className="p-6">
          <p className="text-sm text-red-400">Error: {error || 'Failed to load key summary'}</p>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      label: 'Keys',
      value: data.all_keys,
      sublabel: 'Keys Generated',
      icon: KeyRound,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      animated: false,
      highlighted: true,
    },
    {
      label: 'Secret Keys',
      value: data.all_secret,
      sublabel: 'Keys with Secret',
      icon: Lock,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      animated: false,
      highlighted: false,
    },
    {
      label: 'Master Keys',
      value: data.all_msk,
      sublabel: 'Master key set',
      icon: Key,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      animated: false,
      highlighted: false,
    },
    {
      label: 'Active',
      value: data.active,
      subtitle: 'Currently in use',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      animated: true,
      highlighted: true,
    },
    {
      label: 'Expiring Soon',
      value: data.expiring_soon,
      subtitle: 'Within 30 days',
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      animated: true,
      highlighted: true,
    },
    {
      label: 'Inactive',
      value: data.inactive,
      subtitle: 'Not in use',
      icon: ShieldX,
      iconColor: 'text-zinc-400',
      iconBg: 'bg-zinc-500/10',
      animated: false,
      highlighted: true,
    },
    {
      label: 'Revoked',
      value: data.revoked,
      subtitle: 'Access denied',
      icon: Ban,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      animated: false,
      highlighted: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`border-border/30 backdrop-blur stat-card-hover group overflow-hidden relative transition-all ${
            stat.highlighted
              ? 'bg-card/80 border-border/60 shadow-md hover:shadow-lg'
              : 'bg-card/30 border-border/20 opacity-75 hover:opacity-85'
          }`}
        >
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground font-sans uppercase tracking-wide">{stat.label}</p>
                <div className={`p-2.5 rounded-lg ${stat.iconBg} backdrop-blur-sm`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor} ${stat.animated ? 'animate-pulse-glow' : ''}`} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold font-mono ${stat.iconColor} tracking-tight`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                {stat.sublabel && <p className="text-xs text-muted-foreground mt-2 font-sans">{stat.sublabel}</p>}
                {stat.subtitle && <p className="text-xs text-muted-foreground mt-2 font-sans">{stat.subtitle}</p>}
              </div>
            </div>
          </CardContent>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.iconBg}`} />
        </Card>
      ))}
    </div>
  )
}
