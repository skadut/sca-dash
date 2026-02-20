'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { FileText, Check, Key } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CertificateAvailabilityData {
  csr_avail: number
  crt_avail: number
  key_avail: number
  total_cert: number
}

interface CertAvailKeySecretResponse {
  certificate_availability: CertificateAvailabilityData
  key_secret: any
  isUsingMockData?: boolean
}

export function CertificateAvailability() {
  const [data, setData] = useState<CertificateAvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertAvailData = async () => {
      try {
        setLoading(true)
        console.log('[v0] Fetching certificate availability from: /api/certavail-keysecret-dashboard')

        const response = await fetch('/api/certavail-keysecret-dashboard')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json() as CertAvailKeySecretResponse
        console.log('[v0] Certificate availability data fetched successfully:', responseData)
        setData(responseData.certificate_availability)
        setError(null)
      } catch (err) {
        console.error('[v0] Failed to fetch certificate availability data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchCertAvailData()
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <CardTitle className="text-lg">Certificate File Availability</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">CSR, CRT, and Key file distribution</p>
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
          <CardTitle className="text-lg">Certificate File Availability</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">CSR, CRT, and Key file distribution</p>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-400">Error: {error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    {
      name: 'Available',
      CSR: data.csr_avail,
      CRT: data.crt_avail,
      Key: data.key_avail,
    },
    {
      name: 'Total',
      CSR: data.total_cert,
      CRT: data.total_cert,
      Key: data.total_cert,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{payload[0]?.payload.name}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Certificate File Availability</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">CSR, CRT, and Key file distribution</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="CSR" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CRT" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Key" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">CSR Files</p>
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-400">{data.csr_avail}</p>
            <p className="text-xs text-muted-foreground mt-1">of {data.total_cert} total</p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">CRT Files</p>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">{data.crt_avail}</p>
            <p className="text-xs text-muted-foreground mt-1">of {data.total_cert} total</p>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Key Files</p>
            </div>
            <p className="text-2xl font-bold font-mono text-amber-400">{data.key_avail}</p>
            <p className="text-xs text-muted-foreground mt-1">of {data.total_cert} total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
