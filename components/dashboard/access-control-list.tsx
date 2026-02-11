'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, Building2, Zap, Users, Database } from 'lucide-react'
import type { CertificateUsageData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AccessControlListProps {
  data: CertificateUsageData
}

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate statistics
  const totalCertificates = Object.keys(data).length
  const totalApplications = Object.values(data).reduce((acc, apps) => acc + apps.length, 0)
  const totalInstitutions = new Set(
    Object.values(data).flatMap((apps) => apps.map((app) => app.nama_instansi))
  ).size

  // Prepare data for chart
  const chartData = Object.entries(data)
    .map(([certId, apps]) => ({
      name: certId.replace('CS', '').substring(0, 12),
      applications: apps.length,
      certId: certId,
    }))
    .sort((a, b) => b.applications - a.applications)

  // Prepare pie chart data for institution distribution
  const institutionMap = new Map<string, number>()
  Object.values(data).forEach((apps) => {
    apps.forEach((app) => {
      institutionMap.set(app.nama_instansi, (institutionMap.get(app.nama_instansi) || 0) + 1)
    })
  })

  const pieData = Array.from(institutionMap.entries()).map(([name, count], index) => ({
    name: name.substring(0, 20),
    value: count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6],
  }))

  // Filter certificates
  const filteredData = Object.entries(data).filter(
    ([certId, apps]) =>
      certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apps.some(
        (app) =>
          app.nama_instansi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.nama_aplikasi.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  // Get color for certificate
  const getCertificateColor = (index: number): string => {
    const colors = ['bg-blue-500/10 text-blue-700', 'bg-green-500/10 text-green-700', 'bg-amber-500/10 text-amber-700', 'bg-purple-500/10 text-purple-700', 'bg-pink-500/10 text-pink-700']
    return colors[index % colors.length]
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
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
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

          {/* Square Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No results found</p>
              </div>
            ) : (
              filteredData.map(([certId, apps], index) => (
                <Card key={certId} className="hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm truncate text-primary">{certId}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{apps.length} application(s)</p>
                      </div>
                      <Badge className={cn('shrink-0', getCertificateColor(index))}>{apps.length}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Applications List */}
                    <div className="space-y-2">
                      {apps.map((app, appIndex) => (
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


