'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, Building2, Zap, Users, Database, ChevronDown, ChevronUp } from 'lucide-react'
import type { CertificateUsageData, CertificateUsageWithHSM } from '@/lib/types'
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

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'apps' | 'hsm'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // HSM color configuration
  const getHSMColor = (hsm: string): string => {
    const hsmLower = hsm.toLowerCase()
    if (hsmLower.includes('spbe')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    if (hsmLower.includes('iiv')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (hsmLower.includes('thales') || hsmLower.includes('luna')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }

  const toggleRowExpanded = (certId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(certId)) {
      newExpanded.delete(certId)
    } else {
      newExpanded.add(certId)
    }
    setExpandedRows(newExpanded)
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

  // Prepare data for chart
  const chartData = certArray
    .filter((cert) => cert && cert.used_by)
    .map((cert) => ({
      name: cert.app_id_label.replace('CS', '').substring(0, 12),
      applications: cert.used_by.length,
      certId: cert.app_id_label,
    }))
    .sort((a, b) => b.applications - a.applications)

  // Prepare pie chart data for institution distribution
  const institutionMap = new Map<string, number>()
  certArray.forEach((cert) => {
    if (!cert || !cert.used_by) return
    cert.used_by.forEach((app) => {
      institutionMap.set(app.nama_instansi, (institutionMap.get(app.nama_instansi) || 0) + 1)
    })
  })

  const pieData = Array.from(institutionMap.entries()).map(([name, count], index) => ({
    name: name.substring(0, 20),
    value: count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6],
  }))

  // Filter and sort certificates
  const filteredAndSortedData = useMemo(() => {
    let filtered = certArray.filter((cert) => {
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

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0
      if (sortBy === 'name') {
        compareValue = a.app_id_label.localeCompare(b.app_id_label)
      } else if (sortBy === 'apps') {
        compareValue = a.used_by.length - b.used_by.length
      } else if (sortBy === 'hsm') {
        compareValue = a.hsm.localeCompare(b.hsm)
      }
      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return filtered
  }, [certArray, searchQuery, sortBy, sortOrder])

  const handleSort = (newSortBy: 'name' | 'apps' | 'hsm') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

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
                <Bar dataKey="applications" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Distribution</CardTitle>
            <CardDescription>Applications by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  labelProps={{
                    fill: '#ffffff',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Certificate Access Overview</CardTitle>
              <CardDescription>
                Showing {filteredAndSortedData.length} of {certArray.length} certificates
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Certificate ID
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    <button
                      onClick={() => handleSort('hsm')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      HSM
                      {sortBy === 'hsm' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    <button
                      onClick={() => handleSort('apps')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Applications
                      {sortBy === 'apps' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No certificates found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((cert) => (
                    <tbody key={cert.app_id_label}>
                      <tr
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => toggleRowExpanded(cert.app_id_label)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{cert.app_id_label}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={cn('font-mono text-xs', getHSMColor(cert.hsm))}>
                            {cert.hsm}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-muted-foreground">{cert.used_by.length}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {expandedRows.has(cert.app_id_label) ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(cert.app_id_label) && (
                        <tr className="border-b border-border/50 bg-muted/30">
                          <td colSpan={4} className="py-4 px-4">
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-foreground">Applications</p>
                              <div className="space-y-2">
                                {cert.used_by.map((app, idx) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">{app.nama_aplikasi}</p>
                                      <p className="text-xs text-muted-foreground">{app.nama_instansi}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
