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
        const response = await fetch('/api/utility-trends-dashboard')
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }
        
        const trendsData = await response.json()
        setData(trendsData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch utility trends:', err)
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

      {/* Summary Cards - Redesigned for Better UX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Unified Keys Card - Elegant Main Focus */}
        <Card className="lg:col-span-2 border-cyan-500/20 bg-gradient-to-br from-card to-card/50 hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-8">
              {/* Header with Icon */}
              <div className="flex items-baseline gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/10 flex-shrink-0">
                  <Activity className="h-6 w-6 text-cyan-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Keys</span>
                  <span className="text-5xl font-bold text-foreground leading-none mt-2">{data.total_keys}</span>
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-border/20" />
              
              {/* Key Type Breakdown - Minimalist Numeric Focus */}
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Master</span>
                  <span className="text-3xl font-bold text-foreground">{data.total_msk}</span>
                  <div className="w-1 h-1 rounded-full bg-purple-500/40" />
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Secret</span>
                  <span className="text-3xl font-bold text-foreground">{data.total_secret}</span>
                  <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Certificates Card */}
        <Card className="border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center h-full">
            <div className="p-3 rounded-lg bg-emerald-500/10 mb-4">
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center mb-2">Certificates</span>
            <span className="text-4xl font-bold text-foreground">{data.total_certificates}</span>
          </CardContent>
        </Card>

        {/* Avg Keys/Month Card */}
        <Card className="border-blue-500/10 hover:border-blue-500/20 transition-colors">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center h-full">
            <div className="p-3 rounded-lg bg-blue-500/10 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center mb-2">Keys/Month</span>
            <span className="text-4xl font-bold text-foreground">{data.avg_keys_month}</span>
          </CardContent>
        </Card>

        {/* Avg Certs/Month Card */}
        <Card className="border-amber-500/10 hover:border-amber-500/20 transition-colors">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center h-full">
            <div className="p-3 rounded-lg bg-amber-500/10 mb-4">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center mb-2">Certs/Month</span>
            <span className="text-4xl font-bold text-foreground">{data.avg_certs_month}</span>
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
