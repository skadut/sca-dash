'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CertificateTable } from '@/components/dashboard/certificate-table'
import { NavigationTabs } from '@/components/dashboard/navigation-tabs'
import { UtilityTrends } from '@/components/dashboard/utility-trends'
import { DataModeToggle } from '@/components/dashboard/data-mode-toggle'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { FileDistribution } from '@/components/dashboard/file-distribution'
import { KeySecretRelationship } from '@/components/dashboard/key-secret-relationship'
import { CertificateAvailability } from '@/components/dashboard/certificate-availability'
import { Sidebar } from '@/components/dashboard/sidebar'
import { CombinedHSMVisualization } from '@/components/dashboard/combined-hsm-visualization'
import { KeyInventoryToggle } from '@/components/dashboard/key-inventory-toggle'
import { CertificateAccessToggle } from '@/components/dashboard/certificate-access-toggle'
import { KeyTable } from '@/components/dashboard/key-table'
import { StatsCardsSkeleton, TableSkeleton, GraphSkeleton } from '@/components/dashboard/loading-skeleton'
import { Shield, AlertCircle, RefreshCw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Certificate, Key, CertificateUsageData } from '@/lib/types'
import { AccessControlList } from '@/components/dashboard/access-control-list'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type DataMode = 'mock' | 'database'

export default function DashboardPage(): React.ReactElement {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'inventory' | 'certificates' | 'acl'>('dashboard')
  const [dataMode, setDataMode] = useState<DataMode>('mock')
  const [activeTab, setActiveTab] = useState<'status' | 'traffic'>('status')
  const [pageKey, setPageKey] = useState(0)

  // Trigger re-render and animation when changing pages
  const handleMenuChange = (menu: 'dashboard' | 'inventory' | 'certificates' | 'acl') => {
    setActiveMenu(menu)
    setPageKey((prev) => prev + 1)
  }

  const { data, error, isLoading, mutate } = useSWR<{
    certificates: Certificate[]
    isUsingMockData: boolean
    connectionFailed?: boolean
    message?: string
  }>(`/api/certificates?mode=${dataMode}`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const { data: keysData, error: keysError, isLoading: keysLoading } = useSWR<{
    keys: Key[]
    isUsingMockData: boolean
    connectionFailed?: boolean
    message?: string
  }>(`/api/keys?mode=${dataMode}`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const { data: aclData, error: aclError, isLoading: aclLoading } = useSWR<{
    data: CertificateUsageData
    isUsingMockData: boolean
    connectionFailed?: boolean
    message?: string
  }>(`/api/acl?mode=${dataMode}`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })



  const certificates = data?.certificates || []
  const keys = keysData?.keys || []
  const aclData2 = aclData?.data || { data: [] }
  const isConnected = data?.isUsingMockData === false

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuChange={(menu) => setActiveMenu(menu as typeof activeMenu)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border/50 bg-card">
          <div className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">HSM Certificate Access Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Monitor and manage HSM cryptography certificate lifecycle
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <DataModeToggle mode={dataMode} onModeChange={setDataMode} isConnected={isConnected} />
            </div>

            {dataMode === "database" && data?.connectionFailed && (
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-700">Database Connection Unavailable</p>
                      <p className="text-sm text-muted-foreground">{data.message} - Showing mock data as fallback.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">Failed to load certificates</p>
                      <p className="text-sm text-muted-foreground">
                        {error.message || "Please check your database connection and try again."}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => mutate()} className="ml-auto">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <>
                <StatsCardsSkeleton />
                <TableSkeleton />
              </>
            ) : (
              <div className="page-content" key={pageKey}>
                {activeMenu === 'dashboard' && (
                  <>
                    <div className="page-enter">
                      <CombinedHSMVisualization />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-enter" style={{ animationDelay: '50ms' }}>
                      <FileDistribution certificates={certificates} />
                      <KeySecretRelationship />
                    </div>
                    <div className="page-enter" style={{ animationDelay: '100ms' }}>
                      <UtilityTrends />
                    </div>
                  </>
                )}
                {activeMenu === 'inventory' && (
                  <>
                    <div className="page-enter">
                      <KeyInventoryToggle keys={keys} />
                    </div>
                    <div className="page-enter" style={{ animationDelay: '50ms' }}>
                      <KeyTable keys={keys} />
                    </div>
                  </>
                )}
                {activeMenu === 'certificates' && (
                  <>
                    <div className="page-enter">
                      <CertificateAccessToggle certificates={certificates} />
                    </div>
                    <div className="page-enter mt-12" style={{ animationDelay: '50ms' }}>
                      <CertificateTable certificates={certificates} />
                    </div>
                  </>
                )}
                {activeMenu === 'acl' && (
                  <>
                    {aclLoading ? (
                      <div className="page-enter">
                        <StatsCardsSkeleton />
                      </div>
                    ) : aclError ? (
                      <div className="page-enter">
                        <Card className="border-destructive/50 bg-destructive/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                              <div>
                                <p className="font-medium text-destructive">Failed to load ACL data</p>
                                <p className="text-sm text-muted-foreground">
                                  {aclError.message || 'Please check your connection and try again.'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="page-enter">
                        <AccessControlList data={aclData2} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
