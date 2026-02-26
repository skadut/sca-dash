'use client'

import { useState, useEffect } from 'react'
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

interface GraphData {
  id_login: string
  nama_instansi: string
  total_applications: number
  applications: string[]
  total_msk: number
  total_secret: number
  total_keys: number
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

// Color palette for bars
const barColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f97316',
]

// Custom tooltip for stacked bar chart - displays institution data
const CustomStackedBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const institutionData = payload[0].payload
    
    return (
      <div className="bg-black/90 border border-white/10 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-white font-semibold text-sm mb-2">{institutionData.nama_instansi}</p>
        <p className="text-gray-300 text-xs mb-1">
          <span className="text-gray-400">Total Keys:</span> <span className="font-mono text-cyan-400">{institutionData.total_keys}</span>
        </p>
        <p className="text-gray-300 text-xs mb-2">
          <span className="text-gray-400">Total Applications:</span> <span className="font-mono text-emerald-400">{institutionData.total_applications}</span>
        </p>
        {institutionData.applications && institutionData.applications.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-gray-400 text-xs mb-1">Applications:</p>
            <div className="grid grid-cols-5 gap-1">
              {institutionData.applications.map((app: string, idx: number) => (
                <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30 text-center">
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [graphData, setGraphData] = useState<GraphData[]>([])
  const [graphLoading, setGraphLoading] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [certData, setCertData] = useState<any[]>([])
  const [totalCerts, setTotalCerts] = useState(0)
  const [certLoading, setCertLoading] = useState(false)
  const [statsData, setStatsData] = useState({ sum_cert_integrated: 0, sum_institutions: 0, sum_key_integrated: 0 })

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setGraphLoading(true)
        console.log('[v0] Fetching cert-usage-graph from: /api/cert-usage-graph')

        const response = await fetch('/api/cert-usage-graph')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json()
        console.log('[v0] Cert-usage-graph data fetched successfully:', responseData)
        setGraphData(responseData.data || [])
        
        // Extract stats from root level of API response
        setStatsData({
          sum_cert_integrated: responseData.sum_cert_integrated || 0,
          sum_institutions: responseData.sum_institutions || 0,
          sum_key_integrated: responseData.sum_key_integrated || 0,
        })
        console.log('[v0] Stats extracted:', { sum_cert_integrated: responseData.sum_cert_integrated, sum_institutions: responseData.sum_institutions, sum_key_integrated: responseData.sum_key_integrated })
      } catch (err) {
        console.error('[v0] Failed to fetch cert-usage-graph:', err)
        setGraphData([])
      } finally {
        setGraphLoading(false)
      }
    }

    fetchGraphData()
  }, [])

  // Fetch certificate data with pagination
  useEffect(() => {
    const fetchCertData = async () => {
      try {
        setCertLoading(true)
        const params = new URLSearchParams({
          limit: itemsPerPage.toString(),
          page: currentPage.toString(),
        })
        console.log(`[v0] Fetching certificates with limit=${itemsPerPage}, page=${currentPage}`)

        const response = await fetch(`/api/cert-usage-all?${params}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const responseData = await response.json()
        setCertData(responseData.data || [])
        setTotalCerts(responseData.total_certs_integrated || responseData.total || 0)
      } catch (err) {
        console.error('[v0] Failed to fetch certificates:', err)
        setCertData([])
      } finally {
        setCertLoading(false)
      }
    }

    fetchCertData()
  }, [itemsPerPage, currentPage])

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
  const totalCertificates = statsData.sum_cert_integrated
  const totalApplications = statsData.sum_key_integrated
  const totalInstitutions = statsData.sum_institutions
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

  // Use certData from API if available, otherwise fall back to mock certArray
  const tableData = Array.isArray(certData) && certData.length > 0 ? certData : certArray

  // Filter certificates based on search (for display purposes only - API handles pagination)
  const displayData = tableData.filter((cert) => {
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
          {graphLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading graph data...</p>
            </div>
          ) : graphData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.2} />
                <XAxis 
                  dataKey="nama_instansi" 
                  height={100}
                  tick={{ fontSize: 11, width: 70, wordBreak: 'break-word' }}
                  interval={0}
                  tickFormatter={(value: string) => value}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomStackedBarTooltip />} />
                <Bar dataKey="total_applications" name="Applications" radius={[4, 4, 0, 0]} 
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props
                    if (!payload) return null
                    const barIndex = graphData.findIndex(item => item.nama_instansi === payload.nama_instansi)
                    const color = barColors[barIndex % barColors.length]
                    return (
                      <rect x={x} y={y} width={width} height={height} fill={color} />
                    )
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
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
            {certLoading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p>Loading certificate data...</p>
              </div>
            ) : tableData.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No certificate data available</p>
              </div>
            ) : (
              tableData.map((cert) => {
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

          {/* Pagination Controls */}
          {tableData.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/30">
              {/* Rows per page dropdown - Left side */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1.5 text-sm rounded-md border border-border/30 bg-background text-foreground hover:border-border/50 transition-colors cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination display and arrows - Right side */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCerts)} of {totalCerts}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1.5 text-sm rounded-md border border-border/30 hover:border-border/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-8 h-8"
                >
                  <span>&lt;</span>
                </button>
                
                <button
                  onClick={() => {
                    const maxPage = Math.ceil(totalCerts / itemsPerPage)
                    setCurrentPage(prev => Math.min(prev + 1, maxPage))
                  }}
                  disabled={currentPage >= Math.ceil(totalCerts / itemsPerPage)}
                  className="px-2 py-1.5 text-sm rounded-md border border-border/30 hover:border-border/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-8 h-8"
                >
                  <span>&gt;</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
