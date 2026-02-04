"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { parseDate } from "@/lib/certificate-utils"
import type { Certificate } from "@/lib/types"
import { CalendarDays, TrendingUp, Activity, Clock } from "lucide-react"

interface TrafficGraphProps {
  certificates: Certificate[]
}

type TimeSpan = "monthly" | "yearly"
type HsmFilter = "all" | "alpha" | "beta"

const YEAR_COLOR_MAP: Record<number, { stroke: string; fill: string }> = {
  2024: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.2)" }, // blue
  2025: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.2)" }, // green
  2026: { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.2)" }, // orange
  2027: { stroke: "#8b5cf6", fill: "rgba(139, 92, 246, 0.2)" }, // purple
  2028: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.2)" }, // red
}

const getYearColor = (year: number) => {
  return YEAR_COLOR_MAP[year] || { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.2)" }
}

export function TrafficGraph({ certificates }: TrafficGraphProps) {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>("monthly")
  const [hsmFilter, setHsmFilter] = useState<HsmFilter>("all")

  const chartData = useMemo(() => {
    const filteredCerts = certificates.filter((cert) => {
      if (hsmFilter === "all") return true
      if (hsmFilter === "alpha") return cert.hsm?.toUpperCase() === "SPBE"
      if (hsmFilter === "beta") return cert.hsm?.toUpperCase() === "IIV"
      return true
    })

    if (timeSpan === "monthly") {
      const years = [...new Set(filteredCerts.map((cert) => parseDate(cert.created_date).getFullYear()))].sort()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      const monthlyData = months.map((month, idx) => {
        const dataPoint: any = { month }

        years.forEach((year) => {
          const count = filteredCerts.filter((cert) => {
            const date = parseDate(cert.created_date)
            return date.getFullYear() === year && date.getMonth() === idx
          }).length
          dataPoint[`year${year}`] = count
        })

        return dataPoint
      })

      return { data: monthlyData, years }
    } else {
      // Yearly view
      const groupedData: Record<string, number> = {}

      filteredCerts.forEach((cert) => {
        const date = parseDate(cert.created_date)
        const key = `${date.getFullYear()}`
        groupedData[key] = (groupedData[key] || 0) + 1
      })

      const data = Object.entries(groupedData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, certificates]) => ({ period, certificates }))

      return { data, years: [] }
    }
  }, [certificates, timeSpan, hsmFilter])

  const totalCertsInPeriod = useMemo(() => {
    if (timeSpan === "monthly" && chartData.years.length > 0) {
      return chartData.data.reduce((sum, d) => {
        return sum + chartData.years.reduce((yearSum, year) => yearSum + (d[`year${year}`] || 0), 0)
      }, 0)
    }
    return chartData.data.reduce((sum, d) => sum + (d.certificates || 0), 0)
  }, [chartData, timeSpan])

  const avgPerPeriod = chartData.data.length > 0 ? (totalCertsInPeriod / chartData.data.length).toFixed(1) : 0

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
          <h2 className="text-2xl font-semibold">Certificate Traffic Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total in Range</p>
                <p className="text-2xl font-semibold">{totalCertsInPeriod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg per Period</p>
                <p className="text-2xl font-semibold">{avgPerPeriod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CalendarDays className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Periods</p>
                <p className="text-2xl font-semibold">{chartData.data.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Certificate Creation Traffic</CardTitle>
              <CardDescription>Number of certificates created over time based on created_date</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={hsmFilter}
                onChange={(e) => setHsmFilter(e.target.value as HsmFilter)}
                className="px-3 py-2 text-sm rounded-md border border-border bg-background font-sans"
              >
                <option value="all">All HSM</option>
                <option value="alpha">Klavis SPBE</option>
                <option value="beta">Klavis IIV</option>
              </select>

              <div className="flex gap-1 p-1 bg-muted rounded-md">
                {(["monthly", "yearly"] as const).map((span) => (
                  <button
                    key={span}
                    onClick={() => setTimeSpan(span)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      timeSpan === span
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {span === "monthly" ? "Month" : "Year"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              certificates: {
                label: "Certificates",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey={timeSpan === "monthly" ? "month" : "period"}
                  tick={{ fontSize: 12 }}
                  angle={timeSpan === "monthly" ? 0 : -45}
                  textAnchor={timeSpan === "monthly" ? "middle" : "end"}
                  height={60}
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
                              {timeSpan === "monthly" ? "Month" : "Period"}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.month || payload[0].payload.period}
                            </span>
                          </div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.name}</span>
                              <span className="font-bold" style={{ color: entry.stroke }}>
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }}
                />
                {timeSpan === "monthly" && chartData.years.length > 0 ? (
                  chartData.years.map((year) => {
                    const colors = getYearColor(year)
                    return (
                      <Area
                        key={year}
                        type="monotone"
                        dataKey={`year${year}`}
                        name={`${year}`}
                        stroke={colors.stroke}
                        fill={colors.fill}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        fillOpacity={1}
                      />
                    )
                  })
                ) : (
                  <Area
                    type="monotone"
                    dataKey="certificates"
                    name="Certificates"
                    stroke="#3b82f6"
                    fill="rgba(59, 130, 246, 0.2)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    fillOpacity={1}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
