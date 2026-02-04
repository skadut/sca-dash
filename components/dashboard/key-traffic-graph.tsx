"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import type { Key } from "@/lib/types"
import { CalendarDays, TrendingUp, Activity, Clock } from "lucide-react"

interface KeyTrafficGraphProps {
  keys: Key[]
}

type TimeSpan = "monthly" | "yearly"
type HsmFilter = "all" | "klavis-spbe" | "klavis-iiv" | "thales-luna"

const YEAR_COLOR_MAP: Record<number, { stroke: string; fill: string }> = {
  2024: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.2)" },
  2025: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.2)" },
  2026: { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.2)" },
  2027: { stroke: "#8b5cf6", fill: "rgba(139, 92, 246, 0.2)" },
  2028: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.2)" },
}

const getYearColor = (year: number) => {
  return YEAR_COLOR_MAP[year] || { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.2)" }
}

const parseKeyDate = (dateStr: string): Date => {
  // Parse yyyy/mm/dd format
  const [year, month, day] = dateStr.split("/").map(Number)
  return new Date(year, month - 1, day)
}

export function KeyTrafficGraph({ keys }: KeyTrafficGraphProps) {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>("monthly")
  const [hsmFilter, setHsmFilter] = useState<HsmFilter>("all")

  const chartData = useMemo(() => {
    const filteredKeys = keys.filter((key) => {
      if (hsmFilter === "all") return true
      return key.hsm === hsmFilter
    })

    if (timeSpan === "monthly") {
      const years = [...new Set(filteredKeys.map((key) => parseKeyDate(key.key_created).getFullYear()))].sort()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      const monthlyData = months.map((month, idx) => {
        const dataPoint: any = { month }

        years.forEach((year) => {
          const count = filteredKeys.filter((key) => {
            const date = parseKeyDate(key.key_created)
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

      filteredKeys.forEach((key) => {
        const date = parseKeyDate(key.key_created)
        const yearKey = `${date.getFullYear()}`
        groupedData[yearKey] = (groupedData[yearKey] || 0) + 1
      })

      const data = Object.entries(groupedData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, keys]) => ({ period, keys }))

      return { data, years: [] }
    }
  }, [keys, timeSpan, hsmFilter])

  const totalKeysInPeriod = useMemo(() => {
    if (timeSpan === "monthly" && chartData.years.length > 0) {
      return chartData.data.reduce((sum, d) => {
        return sum + chartData.years.reduce((yearSum, year) => yearSum + (d[`year${year}`] || 0), 0)
      }, 0)
    }
    return chartData.data.reduce((sum, d) => sum + (d.keys || 0), 0)
  }, [chartData, timeSpan])

  const avgPerPeriod = chartData.data.length > 0 ? (totalKeysInPeriod / chartData.data.length).toFixed(1) : 0

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
          <h2 className="text-2xl font-semibold">Key Traffic Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-medium font-mono">{currentTime}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-sans">Total in Range</p>
                <p className="text-2xl font-semibold font-mono text-primary">{totalKeysInPeriod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-sans">Avg per Period</p>
                <p className="text-2xl font-semibold font-mono text-emerald-500">{avgPerPeriod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CalendarDays className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-sans">Time Periods</p>
                <p className="text-2xl font-semibold font-mono text-blue-500">{chartData.data.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30 bg-card/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="font-sans">Key Creation Traffic</CardTitle>
              <CardDescription className="font-sans">Number of keys created over time based on key_created date</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={hsmFilter}
                onChange={(e) => setHsmFilter(e.target.value as HsmFilter)}
                className="px-3 py-2 text-sm rounded-md border border-border bg-background font-sans"
              >
                <option value="all">All HSM</option>
                <option value="klavis-spbe">Klavis SPBE</option>
                <option value="klavis-iiv">Klavis IIV</option>
                <option value="thales-luna">Thales Luna</option>
              </select>

              <div className="flex gap-1 p-1 bg-muted rounded-md">
                {(["monthly", "yearly"] as const).map((span) => (
                  <button
                    key={span}
                    onClick={() => setTimeSpan(span)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors font-sans ${
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
              keys: {
                label: "Keys",
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
                            <span className="text-[0.70rem] uppercase text-muted-foreground font-sans">
                              {timeSpan === "monthly" ? "Month" : "Period"}
                            </span>
                            <span className="font-bold text-muted-foreground font-mono">
                              {payload[0].payload.month || payload[0].payload.period}
                            </span>
                          </div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground font-sans">{entry.name}</span>
                              <span className="font-bold font-mono" style={{ color: entry.stroke }}>
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
                    dataKey="keys"
                    name="Keys"
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
