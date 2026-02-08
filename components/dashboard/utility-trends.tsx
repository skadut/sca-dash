"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { parseDate } from "@/lib/certificate-utils"
import type { Certificate, Key } from "@/lib/types"
import { TrendingUp, Activity, Clock } from "lucide-react"

interface UtilityTrendsProps {
  certificates: Certificate[]
  keys: Key[]
}

export function UtilityTrends({ certificates, keys }: UtilityTrendsProps) {
  const chartData = useMemo(() => {
    // Get the last 6 months from today
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    
    // Initialize months
    const months: Array<{ month: string; keys: number; certificates: number }> = []
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1)
      const monthName = date.toLocaleString("en-US", { month: "short" })
      months.push({ month: monthName, keys: 0, certificates: 0 })
    }

    // Count keys created in each month
    keys.forEach((key) => {
      if (!key.created_at) return
      const date = new Date(key.created_at)
      if (date >= sixMonthsAgo && date <= now) {
        const monthIndex = date.getMonth() - sixMonthsAgo.getMonth()
        if (monthIndex >= 0 && monthIndex < 6) {
          months[monthIndex].keys++
        }
      }
    })

    // Count certificates created in each month
    certificates.forEach((cert) => {
      if (!cert.created_date) return
      const date = parseDate(cert.created_date)
      if (date >= sixMonthsAgo && date <= now) {
        const monthIndex = date.getMonth() - sixMonthsAgo.getMonth()
        if (monthIndex >= 0 && monthIndex < 6) {
          months[monthIndex].certificates++
        }
      }
    })

    return months
  }, [certificates, keys])

  const totalKeys = useMemo(() => chartData.reduce((sum, d) => sum + d.keys, 0), [chartData])
  const totalCerts = useMemo(() => chartData.reduce((sum, d) => sum + d.certificates, 0), [chartData])
  const avgKeys = chartData.length > 0 ? (totalKeys / chartData.length).toFixed(1) : 0
  const avgCerts = chartData.length > 0 ? (totalCerts / chartData.length).toFixed(1) : 0

  const now = new Date()
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Activity className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Keys</p>
                <p className="text-2xl font-semibold">{totalKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-semibold">{totalCerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Keys/Month</p>
                <p className="text-2xl font-semibold">{avgKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Certs/Month</p>
                <p className="text-2xl font-semibold">{avgCerts}</p>
              </div>
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
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
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
