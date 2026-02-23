'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search, Building2, Zap, Users, Database, Award } from 'lucide-react'
import type { CertificateUsageData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AccessControlListProps {
  data: CertificateUsageData
}

// Base colors for each institution
const institutionBaseColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#d946ef', '#0891b2',
  '#84cc16', '#65a30d', '#ea580c', '#dc2626', '#7c3aed', '#9333ea'
]

// Generate gradient shades for a base color (hex) with smoother, more subtle transitions
const generateGradientShades = (baseColor: string, count: number): string[] => {
  if (count <= 1) return [baseColor]
  
  // Convert hex to RGB
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  const shades: string[] = []
  // Use a non-linear interpolation for smoother, more subtle gradient
  for (let i = 0; i < count; i++) {
    const ratio = count === 1 ? 0.5 : i / (count - 1)
    // Use a smoother curve: from 40% (dark) to 100% (light) for more subtle effect
    const easeRatio = 0.4 + ratio * 0.6
    
    const newR = Math.floor(r * easeRatio)
    const newG = Math.floor(g * easeRatio)
    const newB = Math.floor(b * easeRatio)
    
    const hexColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    shades.push(hexColor)
  }
  
  return shades
}

// Custom tooltip for stacked bar chart - displays certificates used by institution
const CustomStackedBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const institutionName = payload[0].payload.nama_instansi
    // Get all certificate entries for this institution
    const certEntries = payload.filter((entry: any) => entry.value === 1).map((entry: any) => entry.dataKey)
    
    return (
      <div className="bg-black/90 border border-white/10 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-white font-semibold text-sm">{institutionName}</p>
        {certEntries.map((cert: string, index: number) => (
          <p key={index} className="font-medium text-sm mt-1 text-cyan-400">
            {cert}: 1
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Get encryption type badge color
  const getEncryptionColor = (keyId?: string): string => {
    if (!keyId) return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    const keyIdLower = keyId.toLowerCase()
    if (keyIdLower.includes('aes')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (keyIdLower.includes('rsa')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  const getEncryptionLabel = (keyId?: string): string => {
    if (!keyId) return 'Unknown'
    const keyIdLower = keyId.toLowerCase()
    if (keyIdLower.includes('aes')) return 'AES'
    if (keyIdLower.includes('rsa')) return 'RSA'
    return 'Unknown'
  }

  // HSM color configuration
  const getHSMColor = (hsm: string): string => {
    const hsmLower = hsm.toLowerCase()
    if (hsmLower.includes('spbe')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    if (hsmLower.includes('iiv')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (hsmLower.includes('thales') || hsmLower.includes('luna')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }

  // Calculate statistics
  // Calculate statistics from API response
  const certArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  
  // Get values from API response if available, otherwise calculate
  const totalCertificates = data?.total_certs_integrated || certArray.length
  const totalApplications = data?.total_keys_integrated || certArray.reduce((acc, cert) => {
    if (!cert || !cert.used_by) return acc
    return acc + cert.used_by.length
  }, 0)
  const totalInstitutions = data?.total_institution || new Set(
    certArray.flatMap((cert) => {
      if (!cert || !cert.used_by) return []
      return cert.used_by.map((app) => app.nama_instansi)
    })
  ).size
  const avgCertPerInstitution = data?.average_cert_institution || (totalCertificates > 0 ? (totalApplications / totalCertificates).toFixed(1) : 0)

  // Get all unique certificate IDs for the stacked bar (sorted) - MUST be before stackedBarDataWithColors
  const allCertIds = Array.from(
    new Set(
      certArray
        .filter(c => c && c.used_by && c.used_by.length > 0)
        .map(c => c.app_id_label)
    )
  ).sort()

  // Prepare stacked bar chart data with gradient colors per institution
  const stackedBarDataWithColors = Array.from(
    certArray.reduce((institutionMap, cert) => {
      if (!cert || !cert.used_by) return institutionMap
      
      cert.used_by.forEach((app) => {
        const instName = app.nama_instansi
        if (!institutionMap.has(instName)) {
          institutionMap.set(instName, {
            nama_instansi: instName,
            certCount: 0,
          })
        }
        
        // Mark that this institution uses this certificate
        const instData = institutionMap.get(instName)!
        const certLabel = cert.app_id_label
        if (!instData[certLabel]) {
          instData[certLabel] = 1
          instData.certCount += 1
        }
      })
      
      return institutionMap
    }, new Map<string, any>()).values()
  ).sort((a, b) => {
    // Sort by number of unique certificates used (descending)
    const aCertCount = a.certCount || 0
    const bCertCount = b.certCount || 0
    return bCertCount - aCertCount
  }).slice(0, 10).map((item, instIndex) => {
    // Generate gradient colors for this institution's certificates
    const baseColor = institutionBaseColors[instIndex % institutionBaseColors.length]
    const certCountForInst = item.certCount || 0
    const gradients = generateGradientShades(baseColor, certCountForInst)
    
    // Assign gradient colors to each certificate for this institution
    const allCertIdsForInst = allCertIds.filter(certId => item[certId])
    allCertIdsForInst.forEach((certId, idx) => {
      item[`${certId}_color`] = gradients[idx % gradients.length]
    })
    
    return item
  })

  // Create Bar components with gradient colors from the data
  const renderBars = () => {
    return allCertIds.map((certId) => {
      return (
        <Bar 
          key={certId} 
          dataKey={certId} 
          stackId="a" 
          fill="#8884d8"
          name={certId.replace('CS', '').substring(0, 12)}
          shape={
            <CustomBarShape 
              certId={certId}
            />
          }
        />
      )
    })
  }

  // Filter certificates
  const filteredData = certArray.filter((cert) => {
    if (!cert || !cert.used_by) return false
    return (
      (cert.app_id_label && cert.app_id_label.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cert.hsm && cert.hsm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cert.used_by.some(
        (app) =>
          (app && app.nama_instansi && app.nama_instansi.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (app && app.nama_aplikasi && app.nama_aplikasi.toLowerCase().includes(searchQuery.toLowerCase()))
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
                <p className="text-sm font-medium text-muted-foreground">Certificates Integrated</p>
                <h3 className="text-3xl font-bold mt-1">{totalCertificates}</h3>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10">
                <Award className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Keys Integrated</p>
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
                <p className="text-sm font-medium text-muted-foreground">Average Certs/Institutions</p>
                <h3 className="text-3xl font-bold mt-1">{Number(avgCertPerInstitution).toFixed(2)}</h3>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Applications per Certificate</CardTitle>
          <CardDescription>Distribution across institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stackedBarDataWithColors} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.2} />
              <XAxis 
                dataKey="nama_instansi" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={false}
                label={{ value: 'Instansi', position: 'bottom', offset: -5 }}
              />
              <YAxis />
              <Tooltip content={<CustomStackedBarTooltip />} />
              {allCertIds.map((certId, index) => {
                return (
                  <Bar 
                    key={certId} 
                    dataKey={certId} 
                    stackId="a" 
                    name={certId.replace('CS', '').substring(0, 12)}
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props
                      if (!payload) return null
                      
                      const instIndex = stackedBarDataWithColors.findIndex(
                        item => item.nama_instansi === payload.nama_instansi
                      )
                      const baseColor = institutionBaseColors[instIndex % institutionBaseColors.length]
                      const gradients = generateGradientShades(
                        baseColor,
                        payload.certCount || 0
                      )
                      
                      const certIndex = allCertIds.indexOf(certId)
                      const color = gradients[certIndex % gradients.length]
                      
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={color}
                        />
                      )
                    }}
                  />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Certificate Usage Section */}
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
              filteredData.map((cert) => {
                // Get unique encryption types for this certificate (with both label and key_id)
                const encryptionTypesMap = new Map<string, string>()
                cert.used_by.forEach(app => {
                  const label = getEncryptionLabel(app.key_id)
                  encryptionTypesMap.set(label, app.key_id)
                })
                const encryptionTypes = Array.from(encryptionTypesMap.entries())
                
                return (
                  <Card key={cert.app_id_label} className="hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm truncate text-primary">{cert.app_id_label}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{cert.used_by.length} application(s)</p>
                          {/* Encryption Type Badges */}
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {encryptionTypes.map(([encType, keyId]) => (
                              <Badge 
                                key={encType}
                                variant="outline" 
                                className={cn('font-mono text-xs', getEncryptionColor(keyId))}
                              >
                                {encType}
                              </Badge>
                            ))}
                          </div>
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
                            <p className="text-xs text-muted-foreground truncate font-mono">{app.key_id}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
