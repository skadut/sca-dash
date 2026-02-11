'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Search, Shield, Key, FileText } from 'lucide-react'
import type { CertificateRelations } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AccessControlListProps {
  data: CertificateRelations
}

export function AccessControlList({ data }: AccessControlListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (certId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(certId)) {
      newExpanded.delete(certId)
    } else {
      newExpanded.add(certId)
    }
    setExpandedItems(newExpanded)
  }

  const filteredRelations = Object.entries(data.relations).filter(
    ([certId, keys]) =>
      certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      keys.some((key) => key.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalKeys = Object.values(data.relations).reduce((acc, keys) => acc + keys.length, 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                <h3 className="text-2xl font-bold mt-1">{data.total_cert_apps}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{totalKeys}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <h3 className="text-2xl font-bold mt-1 capitalize">{data.status}</h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Relations</CardTitle>
          <CardDescription>View and manage certificate-key relationships</CardDescription>
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

          {/* Relations List */}
          <div className="space-y-2">
            {filteredRelations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No results found</p>
              </div>
            ) : (
              filteredRelations.map(([certId, keys]) => {
                const isExpanded = expandedItems.has(certId)
                const keyCount = keys.length

                return (
                  <Collapsible key={certId} open={isExpanded} onOpenChange={() => toggleItem(certId)}>
                    <Card className="border-border/50 hover:border-primary/50 transition-colors">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-semibold text-base">{certId}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {keyCount} {keyCount === 1 ? 'key' : 'keys'} associated
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-auto mr-2">
                              {keyCount}
                            </Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          <div className="pl-11 space-y-2">
                            <div className="border-l-2 border-border/50 pl-4 space-y-2">
                              {keys.map((keyId, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors',
                                    'border border-border/30'
                                  )}
                                >
                                  <Key className="h-4 w-4 text-green-600" />
                                  <span className="font-mono text-sm">{keyId}</span>
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {keyId.includes('aes') ? 'AES-256' : 'RSA-3072'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
