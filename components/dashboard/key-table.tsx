'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Key } from '@/lib/types'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface KeyTableProps {
  keys: Key[]
}

export function KeyTable({ keys }: KeyTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [hsmFilter, setHsmFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [secretStatusFilter, setSecretStatusFilter] = useState<string>('all')
  const [instansiFilter, setInstansiFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof Key>('key_created')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const getKeyStatus = (key: Key): 'active' | 'expired' | 'revoked' => {
    if (key.revoked_key_status) return 'revoked'
    const expiredDate = new Date(key.key_expired.replace(/\//g, '-'))
    const isExpired = expiredDate < new Date()
    return isExpired ? 'expired' : 'active'
  }

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate.replace(/\//g, '-'))
    const today = new Date()
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr: string): string => {
    // Handle format YYYY/MM/DD and convert to "MMM D, YYYY"
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const day = parseInt(parts[2])
      const date = new Date(year, month, day)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    return dateStr
  }

  const filteredAndSortedKeys = useMemo(() => {
    let filtered = keys.filter((key) => {
      const hasSecret = key.secret_data && key.secret_data.trim() !== ''
      const secretStatus = hasSecret ? 'available' : 'no-secret'
      
      const matchesSearch =
        key.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.nama_instansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.id_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.id_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.key_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesHsm = hsmFilter === 'all' || 
        (hsmFilter === 'untagged' ? (!key.hsm || key.hsm.trim() === '') : key.hsm === hsmFilter)
      const matchesStatus = statusFilter === 'all' || getKeyStatus(key) === statusFilter
      const matchesSecretStatus = secretStatusFilter === 'all' || secretStatus === secretStatusFilter
      const matchesInstansi = instansiFilter === 'all' || key.nama_instansi === instansiFilter

      return matchesSearch && matchesHsm && matchesStatus && matchesSecretStatus && matchesInstansi
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1
      }
      return aValue > bValue ? -1 : 1
    })

    return filtered
  }, [keys, searchTerm, hsmFilter, statusFilter, secretStatusFilter, instansiFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedKeys.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentKeys = filteredAndSortedKeys.slice(startIndex, endIndex)

  // Fill empty rows
  const emptyRows = rowsPerPage - currentKeys.length
  const emptyRowsArray = rowsPerPage === 9999 ? [] : Array(Math.max(0, emptyRows)).fill(null)

  const handleSort = (field: keyof Key) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (status: 'active' | 'expired' | 'revoked') => {
    const config = {
      active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      expired: { label: 'Expired', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
      revoked: { label: 'Revoked', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    }
    return (
      <Badge variant="outline" className={`font-mono text-xs ${config[status].className}`}>
        {config[status].label}
      </Badge>
    )
  }

  const getHsmBadge = (hsm: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'klavis-spbe': { label: 'Klavis-SPBE', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
      'klavis-iiv': { label: 'Klavis-IIV', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      'thales-luna': { label: 'Thales-Luna', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    }
    
    const normalizedHsm = hsm?.toLowerCase() || ''
    if (!normalizedHsm || normalizedHsm.trim() === '') {
      return (
        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-mono text-xs">
          Untagged
        </Badge>
      )
    }
    
    const matchedKey = Object.keys(config).find(key => normalizedHsm.includes(key))
    const hsmConfig = matchedKey ? config[matchedKey] : { label: hsm || 'N/A', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
    
    return (
      <Badge variant="outline" className={`font-mono text-xs ${hsmConfig.className}`}>
        {hsmConfig.label}
      </Badge>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Aplikasi, Instansi, ID, Key ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 w-full"
            />
          </div>
          <Select
            value={secretStatusFilter}
            onValueChange={(value) => {
              setSecretStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Secret Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Secret</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="no-secret">No Secret</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={hsmFilter}
            onValueChange={(value) => {
              setHsmFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="HSM Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All HSM</SelectItem>
              <SelectItem value="Klavis-SPBE">Klavis-SPBE</SelectItem>
              <SelectItem value="Klavis-IIV">Klavis-IIV</SelectItem>
              <SelectItem value="Thales-Luna">Thales-Luna</SelectItem>
              <SelectItem value="untagged">Untagged</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={instansiFilter}
            onValueChange={(value) => {
              setInstansiFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Instansi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instansi</SelectItem>
              {Array.from(new Set(keys.map(k => k.nama_instansi))).map((instansi) => (
                <SelectItem key={instansi} value={instansi}>
                  {instansi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '160px', flexShrink: 0 }} />
              <col style={{ width: '140px', flexShrink: 0 }} />
              <col style={{ width: '130px', flexShrink: 0 }} />
              <col style={{ width: '110px', flexShrink: 0 }} />
              <col style={{ width: '120px', flexShrink: 0 }} />
              <col style={{ width: '120px', flexShrink: 0 }} />
              <col style={{ width: '120px', flexShrink: 0 }} />
              <col style={{ width: '140px', flexShrink: 0 }} />
              <col style={{ width: '100px', flexShrink: 0 }} />
            </colgroup>
            <thead className="bg-muted/30 border-y border-border/30 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('nama_aplikasi')} className="flex items-center gap-1 hover:text-foreground">
                    Aplikasi <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('nama_instansi')} className="flex items-center gap-1 hover:text-foreground">
                    Instansi <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('key_id')} className="flex items-center gap-1 hover:text-foreground">
                    Key ID <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Secret Status
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  HSM
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('key_created')} className="flex items-center gap-1 hover:text-foreground">
                    Created <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('key_expired')} className="flex items-center gap-1 hover:text-foreground">
                    Expired <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Validity
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentKeys.map((key) => {
                const status = getKeyStatus(key)
                const daysLeft = getDaysUntilExpiry(key.key_expired)
                const hasSecret = key.secret_data && key.secret_data.trim() !== ''
                return (
                  <tr key={key.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="p-3 overflow-hidden">
                      <div>
                        <p className="font-medium text-sm truncate">{key.nama_aplikasi}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{key.id_aplikasi}</p>
                      </div>
                    </td>
                    <td className="p-3 overflow-hidden">
                      <div>
                        <p className="font-medium text-sm truncate">{key.nama_instansi}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{key.id_login}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">{key.key_id}</td>
                    <td className="p-3 overflow-hidden">
                      <Badge
                        variant="outline"
                        className={`font-mono text-xs ${
                          hasSecret
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}
                      >
                        {hasSecret ? 'Available' : 'No Secret'}
                      </Badge>
                    </td>
                    <td className="p-3 overflow-hidden">{getHsmBadge(key.hsm)}</td>
                    <td className="p-3 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">{formatDate(key.key_created)}</td>
                    <td className="p-3 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">{formatDate(key.key_expired)}</td>
                    <td className="p-3 overflow-hidden text-ellipsis">
                      {status === 'revoked' ? (
                        <span className="text-sm text-muted-foreground">not valid</span>
                      ) : status === 'expired' ? (
                        <span className="text-sm text-red-400 font-mono">{Math.abs(daysLeft)} days ago</span>
                      ) : daysLeft <= 30 ? (
                        <span className="text-sm text-amber-400 font-mono">{daysLeft} days left</span>
                      ) : (
                        <span className="text-sm text-emerald-400 font-mono">{daysLeft} days left</span>
                      )}
                    </td>
                    <td className="p-3 overflow-hidden text-ellipsis">{getStatusBadge(status)}</td>
                  </tr>
                )
              })}
              {emptyRowsArray.map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-border/20">
                  <td colSpan={9} className="p-3" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="9999">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-mono">
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedKeys.length)} of {filteredAndSortedKeys.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
