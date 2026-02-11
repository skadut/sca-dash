'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, Shield, Key, FileText, Lock } from 'lucide-react'
import type { CertificateRelations } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AccessControlListProps {
  data: CertificateRelations
}

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate statistics
  const totalKeys = Object.values(data.relations).reduce((acc, keys) => acc + keys.length, 0)
  const avgKeysPerCert = data.total_cert_apps > 0 ? (totalKeys / data.total_cert_apps).toFixed(1) : 0

  // Prepare data for chart
  const chartData = Object.entries(data.relations)
    .map(([certId, keys]) => ({
      name: certId.replace('CERT_', '').substring(0, 15),
      keys: keys.length,
      certId: certId,
    }))
    .sort((a, b) => b.keys - a.keys)

  // Prepare pie chart data for key distribution by type
  const aesKeys = Object.values(data.relations).reduce(
    (acc, keys) => acc + keys.filter((k) => k.includes('aes')).length,
    0
  )
  const rsaKeys = Object.values(data.relations).reduce(
    (acc, keys) => acc + keys.filter((k) => k.includes('rsa')).length,
    0
  )

  const pieData = [
    { name: 'AES-256', value: aesKeys, color: '#10b981' },
    { name: 'RSA-3072', value: rsaKeys, color: '#3b82f6' },
  ]

  // Filter certificates
  const filteredRelations = Object.entries(data.relations).filter(
    ([certId, keys]) =>
      certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      keys.some((key) => key.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Get abbreviated name for certificate
  const getAbbreviation = (certId: string): string => {
    const parts = certId.replace('CERT_', '').split('_')
    return parts.map((part) => part[0]).join('').substring(0, 2).toUpperCase()
  }

  // Get category badge for certificate
  const getCategoryBadge = (certId: string): { label: string; color: string } => {
    if (certId.includes('PROD')) return { label: 'Production', color: 'bg-green-500/10 text-green-700' }
    if (certId.includes('UAT')) return { label: 'UAT', color: 'bg-yellow-500/10 text-yellow-700' }
    if (certId.includes('AUDIT')) return { label: 'Audit', color: 'bg-purple-500/10 text-purple-700' }
    if (certId.includes('CRYPTO')) return { label: 'Crypto', color: 'bg-red-500/10 text-red-700' }
    return { label: 'Standard', color: 'bg-blue-500/10 text-blue-700' }
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
                <h3 className="text-3xl font-bold mt-1">{data.total_cert_apps}</h3>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                <h3 className="text-3xl font-bold mt-1">{totalKeys}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Key className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Keys/Cert</p>
                <h3 className="text-3xl font-bold mt-1">{avgKeysPerCert}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <h3 className="text-2xl font-bold mt-1 capitalize">{data.status}</h3>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Shield className="h-6 w-6 text-purple-600" />
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
            <CardTitle>Keys per Certificate</CardTitle>
            <CardDescription>Distribution of keys across certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(0, 10)}>
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
                <Bar dataKey="keys" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Encryption Type Distribution</CardTitle>
            <CardDescription>AES vs RSA key types</CardDescription>
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Access Overview</CardTitle>
          <CardDescription>View all certificates and their associated keys</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates or keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Square Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRelations.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No results found</p>
              </div>
            ) : (
              filteredRelations.map(([certId, keys]) => {
                const category = getCategoryBadge(certId)
                const abbrev = getAbbreviation(certId)
                const keyCount = keys.length
                const aesCount = keys.filter((k) => k.includes('aes')).length
                const rsaCount = keys.filter((k) => k.includes('rsa')).length

                return (
                  <div key={certId} className="group cursor-pointer">
                    <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {abbrev}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                {certId.replace('CERT_', '')}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{certId}</p>
                            </div>
                          </div>
                          <Badge className={cn('shrink-0', category.color)}>{category.label}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Key Count Display */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Keys</span>
                            <span className="text-2xl font-bold text-primary">{keyCount}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{
                                width: `${Math.min((keyCount / 5) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Key Breakdown */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">AES-256</p>
                            <p className="text-lg font-semibold text-green-600">{aesCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">RSA-3072</p>
                            <p className="text-lg font-semibold text-blue-600">{rsaCount}</p>
                          </div>
                        </div>

                        {/* Key Types */}
                        <div className="flex gap-2 flex-wrap pt-2">
                          {aesCount > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200">
                              AES
                            </Badge>
                          )}
                          {rsaCount > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-200">
                              RSA
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

