'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { ShieldCheck, ShieldX } from 'lucide-react'
import { useEffect, useState } from 'react'

interface KeySecretData {
  key_with_secret: number
  key_without_secret: number
}

interface CertAvailKeySecretResponse {
  certificate_availability: any
  key_secret: KeySecretData
  isUsingMockData?: boolean
}

export function KeySecretRelationship() {
  const [data, setData] = useState<KeySecretData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKeySecretData = async () => {
      try {
        setLoading(true)
        console.log('[v0] Fetching key-secret relationship from: /api/certavail-keysecret-dashboard')

        const response = await fetch('/api/certavail-keysecret-dashboard')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json() as CertAvailKeySecretResponse
        console.log('[v0] Key-secret data fetched successfully:', responseData)
        setData(responseData.key_secret)
        setError(null)
      } catch (err) {
        console.error('[v0] Failed to fetch key-secret data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchKeySecretData()
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle className="text-lg">Key-Secret Relationship</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Keys with associated secret data</p>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle className="text-lg">Key-Secret Relationship</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Keys with associated secret data</p>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-400">Error: {error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const withSecret = data.key_with_secret
  const withoutSecret = data.key_without_secret
  const total = withSecret + withoutSecret

  const chartData = [
    { name: 'With Secret', value: withSecret, color: '#10b981' },
    { name: 'Without Secret', value: withoutSecret, color: '#f59e0b' },
  ]

  const percentage = total > 0 ? ((withSecret / total) * 100).toFixed(1) : '0'

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const payloadData = payload[0]
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{payloadData.name}</p>
          <p className="text-sm" style={{ color: payloadData.payload.color }}>
            Count: {payloadData.value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Key-Secret Relationship</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Keys with associated secret data</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">With Secret</p>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">{withSecret}</p>
            <p className="text-xs text-muted-foreground mt-1">{percentage}% of total keys</p>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldX className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Without Secret</p>
            </div>
            <p className="text-2xl font-bold font-mono text-amber-400">{withoutSecret}</p>
            <p className="text-xs text-muted-foreground mt-1">{(100 - parseFloat(percentage)).toFixed(1)}% of total keys</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
