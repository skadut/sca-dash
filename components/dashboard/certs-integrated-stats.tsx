'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CertsIntegratedStatsData {
  sum_cert_integrated: number
  sum_institutions: number
  sum_key_integrated: number
}

export function CertsIntegratedStats() {
  const [stats, setStats] = useState<CertsIntegratedStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/cert-usage-graph')
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }
        
        const data = await response.json()
        
        if (data.stats) {
          setStats(data.stats)
        } else {
          throw new Error('No stats data in response')
        }
      } catch (err) {
        console.error('[v0] Error fetching certs integrated stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const metrics = [
    {
      label: 'Total Integrated Certificates',
      value: stats?.sum_cert_integrated ?? 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Institutions',
      value: stats?.sum_institutions ?? 0,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Total Key Integrated',
      value: stats?.sum_key_integrated ?? 0,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <Card className="border-border/30 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-border/20 pb-4">
        <CardTitle className="text-lg font-semibold">Certs Integrated Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border/20 bg-background/50 p-6 hover:border-border/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <div className={`h-4 w-4 rounded-full ${metric.color}`} />
                  </div>
                </div>
                <p className={`text-4xl font-bold font-mono ${metric.color} tracking-tight`}>
                  {metric.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
