'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts'
import { Search, Building2, Zap, Users, Database } from 'lucide-react'
import type { CertificateUsageData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AccessControlListProps {
  data: CertificateUsageData
}

// Custom tooltip component for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const color = data.payload.color || '#10b981'
    const count = data.value
    const label = count === 1 ? 'application' : 'applications'
    
    return (
      <div className="bg-black/90 border border-white/10 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-white font-semibold text-sm">{data.payload.name}</p>
        <p className="font-medium text-sm mt-1" style={{ color }}>{count} {label}</p>
      </div>
    )
  }
  return null
}

// Custom treemap content renderer
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value, color } = props
  
  if (width < 50 || height < 35) {
    return null
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 2,
          opacity: 0.8,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        fontWeight="bold"
        className="pointer-events-none"
      >
        {name.substring(0, 15)}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="#fff"
        fontSize={11}
        className="pointer-events-none"
      >
        {value} app{value !== 1 ? 's' : ''}
      </text>
    </g>
  )
}
  return null
}

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // HSM color configuration
  const getHSMColor = (hsm: string): string => {
    const hsmLower = hsm.toLowerCase()
    if (hsmLower.includes('spbe')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    if (hsmLower.includes('iiv')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (hsmLower.includes('thales') || hsmLower.includes('luna')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }

  // Distinct colors for bar chart
  const chartColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
    '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#d946ef', '#0891b2'
  ]

  const getChartColor = (index: number): string => {
    return chartColors[index % chartColors.length]
  }

  // Calculate statistics
  const certArray = data?.data || []
  
  const totalCertificates = certArray.length
  const totalApplications = certArray.reduce((acc, cert) => {
    if (!cert || !cert.used_by) return acc
    return acc + cert.used_by.length
  }, 0)
  const totalInstitutions = new Set(
    certArray.flatMap((cert) => {
      if (!cert || !cert.used_by) return []
      return cert.used_by.map((app) => app.nama_instansi)
    })
  ).size

  // Prepare data for chart with distinct colors
  const chartData = certArray
    .filter((cert) => cert && cert.used_by)
    .map((cert, index) => ({
      name: cert.app_id_label.replace('CS', '').substring(0, 12),
      applications: cert.used_by.length,
      certId: cert.app_id_label,
      fill: getChartColor(index),
    }))
    .sort((a, b) => b.applications - a.applications)

  // Prepare treemap data for institution distribution
  const institutionMap = new Map<string, number>()
  certArray.forEach((cert) => {
    if (!cert || !cert.used_by) return
    cert.used_by.forEach((app) => {
      institutionMap.set(app.nama_instansi, (institutionMap.get(app.nama_instansi) || 0) + 1)
    })
  })

  const treemapData = {
    name: 'Institutions',
    children: Array.from(institutionMap.entries()).map(([name, count], index) => ({
      name: name,
      value: count,
      color: chartColors[index % chartColors.length],
    })),
  }

  // Filter certificates
  const filteredData = certArray.filter((cert) => {
    if (!cert || !cert.used_by) return false
    return (
      cert.app_id_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.hsm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.used_by.some(
        (app) =>
          app.nama_instansi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.nama_aplikasi.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  })

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                <h3 className="text-3xl font-bold mt-1">{totalCertificates}</h3>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <h3 className="text-3xl font-bold mt-1">{totalApplications}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                <h3 className="text-3xl font-bold mt-1">{totalInstitutions}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Apps/Cert</p>
                <h3 className="text-3xl font-bold mt-1">{totalCertificates > 0 ? (totalApplications / totalCertificates).toFixed(1) : 0}</h3>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Applications per Certificate</CardTitle>
            <CardDescription>Distribution across certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.2} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="applications" radius={[8, 8, 0, 0]}>
                  {chartData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treemap Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Distribution</CardTitle>
            <CardDescription>Hierarchical view of applications by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={treemapData.children}
                dataKey="value"
                stroke="#fff"
                fill="#8884d8"
                content={<CustomTreemapContent />}
              >
                <Tooltip content={<CustomTreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search and Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Usage</CardTitle>
          <CardDescription>View all certificates and their applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates or applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No results found</p>
              </div>
            ) : (
              filteredData.map((cert) => (
                <Card key={cert.app_id_label} className="hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm truncate text-primary">{cert.app_id_label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{cert.used_by.length} application(s)</p>
                      </div>
                      <Badge variant="outline" className={cn('shrink-0 font-mono text-xs', getHSMColor(cert.hsm))}>{cert.hsm}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Applications List */}
                    <div className="space-y-2">
                      {cert.used_by.map((app, appIndex) => (
                        <div key={appIndex} className="p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <p className="text-xs font-medium text-foreground truncate">{app.nama_aplikasi}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.nama_instansi}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
