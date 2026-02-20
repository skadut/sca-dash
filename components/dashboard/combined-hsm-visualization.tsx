'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface HSMData {
  hsm: string
  keys: number
  certificates: number
}

interface HSMSummaryResponse {
  data: HSMData[]
  status: string
  total_certificates: number
  total_hsm: number
  total_keys: number
  total_msk: number
  total_secret: number
  isUsingMockData?: boolean
}

export function CombinedHSMVisualization() {
  const [data, setData] = useState<HSMData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHSMSummary = async () => {
      try {
        setLoading(true)
        console.log('[v0] Fetching HSM summary from: /api/hsm-summary-dashboard')

        const response = await fetch('/api/hsm-summary-dashboard')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json() as HSMSummaryResponse
        console.log('[v0] HSM summary data fetched successfully:', responseData)
        setData(responseData.data)
        setError(null)
      } catch (err) {
        console.error('[v0] Failed to fetch HSM summary:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchHSMSummary()
  }, [])

  const COLORS = {
    certificates: '#06b6d4',
    keys: '#8b5cf6',
  }

  function getDisplayName(name: string) {
    const normalized = name.toLowerCase()
    if (normalized.includes('spbe')) return 'Klavis-SPBE'
    if (normalized.includes('iiv')) return 'Klavis-IIV'
    if (normalized.includes('thales') || normalized.includes('luna')) return 'Thales-Luna'
    return name
  }

  function getHSMColor(name: string) {
    const normalized = name.toLowerCase()
    if (normalized.includes('spbe')) return '#06b6d4'
    if (normalized.includes('iiv')) return '#8b5cf6'
    if (normalized.includes('thales') || normalized.includes('luna')) return '#f59e0b'
    return '#6b7280'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">HSM Type Distribution</CardTitle>
          <CardDescription className="text-sm">Certificates and Keys by HSM type</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">HSM Type Distribution</CardTitle>
          <CardDescription className="text-sm">Certificates and Keys by HSM type</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-400">Error: {error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  // Format data with display names
  const chartData = data.map((item) => ({
    ...item,
    name: getDisplayName(item.hsm),
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">HSM Type Distribution</CardTitle>
        <CardDescription className="text-sm">Certificates and Keys by HSM type</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              style={{ fontSize: 14, fontWeight: 600 }}
              className="fill-foreground"
            />
            <YAxis
              style={{ fontSize: 14, fontWeight: 600 }}
              className="fill-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (value === 'certificates' ? 'Certificates' : 'Keys')}
              wrapperStyle={{ fontSize: 14 }}
              className="fill-foreground"
            />
            <Bar dataKey="certificates" fill={COLORS.certificates} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="certificates" position="top" className="fill-foreground" fontSize={12} />
            </Bar>
            <Bar dataKey="keys" fill={COLORS.keys} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="keys" position="top" className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* HSM Type Stats Summary */}
        <div className="mt-6 space-y-3">
          {data.map((item) => (
            <div key={item.hsm} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getHSMColor(item.hsm) }} />
                <span className="font-medium text-foreground">{getDisplayName(item.hsm)}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Certificates</p>
                  <p className="font-bold font-mono text-cyan-400">{item.certificates}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Keys</p>
                  <p className="font-bold font-mono text-purple-400">{item.keys}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
