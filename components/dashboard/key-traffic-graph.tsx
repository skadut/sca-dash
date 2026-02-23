'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts'
import { CalendarDays, TrendingUp, Activity, Clock } from 'lucide-react'

interface MonthlyEntry {
  year: number
  month: number
  total_key_created: number
  total_msk_created: number
  total_secret_created: number
}

interface YearlyEntry {
  year: number
  total_key_created: number
  total_msk_created: number
  total_secret_created: number
}

interface KeyCreatedSummaryResponse {
  monthly: MonthlyEntry[]
  yearly: YearlyEntry[]
  isUsingMockData?: boolean
}

type TimeSpan = 'monthly' | 'yearly'

const YEAR_COLOR_MAP: Record<number, { stroke: string; fill: string }> = {
  2024: { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' },
  2025: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' },
  2026: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },
  2027: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
  2028: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
}

const getYearColor = (year: number) => {
  return YEAR_COLOR_MAP[year] || { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' }
}

export function KeyTrafficGraph() {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('monthly')
  const [data, setData] = useState<KeyCreatedSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKeyCreatedSummary = async () => {
      try {
        setLoading(true)
        console.log('[v0] Fetching key-created-summary from: /api/key-created-summary')

        const response = await fetch('/api/key-created-summary')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json() as KeyCreatedSummaryResponse
        console.log('[v0] Key-created-summary data fetched successfully:', responseData)
        setData(responseData)
        setError(null)
      } catch (err) {
        console.error('[v0] Failed to fetch key-created-summary:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchKeyCreatedSummary()
  }, [])

  const chartData = useMemo(() => {
    if (!data) return { data: [], years: [] }

    if (timeSpan === 'monthly') {
      const monthlyData = data.monthly
      const years = [...new Set(monthlyData.map((m) => m.year))].sort()
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      const chartMonthlyData = months.map((month, idx) => {
        const dataPoint: any = { month }

        years.forEach((year) => {
          const entry = monthlyData.find((m) => m.year === year && m.month === idx + 1)
          dataPoint[`year${year}`] = entry?.total_key_created || 0
        })

        return dataPoint
      })

      return { data: chartMonthlyData, years }
    } else {
      // Yearly view
      return {
        data: data.yearly.map((y) => ({
          period: `${y.year}`,
          keys: y.total_key_created,
        })),
        years: [],
      }
    }
  }, [data, timeSpan])

  const totalKeysInPeriod = useMemo(() => {
    if (timeSpan === 'monthly' && chartData.years.length > 0) {
      return chartData.data.reduce((sum, d) => {
        return sum + chartData.years.reduce((yearSum, year) => yearSum + (d[`year${year}`] || 0), 0)
      }, 0)
    }
    return chartData.data.reduce((sum, d) => sum + (d.keys || 0), 0)
  }, [chartData, timeSpan])

  const avgPerPeriod = chartData.data.length > 0 ? (totalKeysInPeriod / chartData.data.length).toFixed(1) : 0

  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-border/30 bg-card/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Loading key traffic data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Card className="border-border/30 bg-card/50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-400">Error: {error || 'Failed to load key traffic data'}</p>
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
              <CardDescription className="font-sans">Number of keys created over time</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-1 p-1 bg-muted rounded-md">
                {(['monthly', 'yearly'] as const).map((span) => (
                  <button
                    key={span}
                    onClick={() => setTimeSpan(span)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors font-sans ${
                      timeSpan === span ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {span === 'monthly' ? 'Month' : 'Year'}
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
                label: 'Keys',
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="h-[400px] w-full"
          >
            <AreaChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} width={1019} height={400}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey={timeSpan === 'monthly' ? 'month' : 'period'}
                tick={{ fontSize: 12 }}
                angle={timeSpan === 'monthly' ? 0 : -45}
                textAnchor={timeSpan === 'monthly' ? 'middle' : 'end'}
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
                            {timeSpan === 'monthly' ? 'Month' : 'Period'}
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
              {timeSpan === 'monthly' && chartData.years.length > 0 ? (
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
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
