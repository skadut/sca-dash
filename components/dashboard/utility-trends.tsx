"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, Activity, Clock, Key } from "lucide-react"

interface MonthlyData {
  month: string
  keys: number
  certificates: number
}

interface UtilityTrendsData {
  total_keys: number
  total_msk: number
  total_secret: number
  total_certificates: number
  avg_keys_month: number
  avg_certs_month: number
  monthly: MonthlyData[]
}

export function UtilityTrends() {
  const [data, setData] = useState<UtilityTrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUtilityTrends = async () => {
      try {
        setLoading(true)
        const aclApiUrl = process.env.NEXT_PUBLIC_ACL_API_URL || '127.0.0.1'
        const aclApiPort = process.env.NEXT_PUBLIC_ACL_API_PORT || '7077'
        const baseUrl = `http://${aclApiUrl}:${aclApiPort}`
        console.log('[v0] Fetching utility trends from:', `${baseUrl}/utility-trends-dashboard`)
        
        const response = await fetch(`${baseUrl}/utility-trends-dashboard`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }
        
        const trendsData = await response.json()
        console.log('[v0] Utility trends data fetched successfully:', trendsData)
        setData(trendsData)
        setError(null)
      } catch (err) {
        console.error('[v0] Failed to fetch utility trends:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchUtilityTrends()
  }, [])

  const now = new Date()
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-medium">{currentTime}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-16 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-red-400">Error loading utility trends: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Summary Cards - 6 Box Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Highlighted - Total Keys */}
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-card hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Keys</span>
                <div className="p-1.5 rounded bg-cyan-500/10">
                  <Activity className="h-3.5 w-3.5 text-cyan-500" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground block">{data.total_keys}</span>
            </div>
          </CardContent>
        </Card>

        {/* Secondary - Master Key */}
        <Card className="border-border/40">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">Master Key</span>
              <span className="text-2xl font-semibold text-foreground">{data.total_msk}</span>
            </div>
          </CardContent>
        </Card>

        {/* Secondary - Secret Key */}
        <Card className="border-border/40">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">Secret Key</span>
              <span className="text-2xl font-semibold text-foreground">{data.total_secret}</span>
            </div>
          </CardContent>
        </Card>

        {/* Highlighted - Total Certificates */}
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-card hover:border-emerald-500/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Certificates</span>
                <div className="p-1.5 rounded bg-emerald-500/10">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground block">{data.total_certificates}</span>
            </div>
          </CardContent>
        </Card>

        {/* Highlighted - Avg Keys/Month */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-card hover:border-blue-500/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keys/Month</span>
                <div className="p-1.5 rounded bg-blue-500/10">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground block">{data.avg_keys_month}</span>
            </div>
          </CardContent>
        </Card>

        {/* Highlighted - Avg Certs/Month */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card hover:border-amber-500/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Certs/Month</span>
                <div className="p-1.5 rounded bg-amber-500/10">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground block">{data.avg_certs_month}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Utility Trends</CardTitle>
            <CardDescription>Keys and certificates created over the last 6 months</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              keys: {
                label: "Keys",
                color: "hsl(186, 100%, 50%)",
              },
              certificates: {
                label: "Certificates",
                color: "hsl(142, 76%, 36%)",
              },
            }}
            className="h-[400px] w-full"
          >
            <AreaChart data={data.monthly} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Month
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload.month}
                          </span>
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.name}</span>
                            <span className="font-bold" style={{ color: entry.color }}>
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="keys"
                name="Keys"
                stroke="hsl(186, 100%, 50%)"
                fill="hsl(186, 100%, 50%, 0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="certificates"
                name="Certificates"
                stroke="hsl(142, 76%, 36%)"
                fill="hsl(142, 76%, 36%, 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
