"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Certificate, CertificateStatus, ValidityStatus } from "@/lib/types"
import { formatDate, getValidityStatus, getCertificateStatus, getDaysUntilExpiry } from "@/lib/certificate-utils"
import { Search, ArrowUpDown, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface CertificateTableProps {
  certificates: Certificate[]
}

export function CertificateTable({ certificates }: CertificateTableProps) {
  const [search, setSearch] = useState("")
  const [hsmFilter, setHsmFilter] = useState<string>('all')
  const [validityFilter, setValidityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<string>('expired_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredAndSortedCerts = useMemo(() => {
    let filtered = certificates.filter((cert) => {
      const matchesSearch =
        cert.app_id_label.toLowerCase().includes(search.toLowerCase())

      const matchesHsm = hsmFilter === 'all' || cert.hsm === hsmFilter
      const matchesStatus = statusFilter === 'all' || getCertificateStatus(cert.expired_date, cert.revoked_app_status) === statusFilter
      const matchesValidity = validityFilter === 'all' || getValidityStatus(cert.expired_date) === validityFilter

      return matchesSearch && matchesHsm && matchesStatus && matchesValidity
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Certificate]
      let bValue: any = b[sortField as keyof Certificate]
      
      // Special handling for validity sorting
      if (sortField === 'validity') {
        const aValidity = getValidityStatus(a.expired_date)
        const bValidity = getValidityStatus(b.expired_date)
        const validityOrder: Record<ValidityStatus, number> = { expired: 0, expiring: 1, valid: 2 }
        aValue = validityOrder[aValidity]
        bValue = validityOrder[bValidity]
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1
      }
      return aValue > bValue ? -1 : 1
    })

    return filtered
  }, [certificates, search, hsmFilter, statusFilter, validityFilter, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedCerts = filteredAndSortedCerts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAndSortedCerts.length / rowsPerPage)
  const emptyRowsArray = Array(Math.max(0, rowsPerPage - paginatedCerts.length))

  // Fixed column widths - never changes based on content
  const COLUMN_WIDTHS = {
    certificateId: '180px',  // Fixed width to handle both short and long IDs
    created: '120px',        // Fixed width for dates
    expired: '120px',        // Fixed width for dates
    hsm: '130px',            // Fixed width for HSM badges
    files: '180px',          // Fixed width for file badges
    validity: '140px',       // Fixed width for validity
    status: '100px',         // Fixed width for status
  }

  const getValidityBadge = (validity: ValidityStatus, daysUntil: number, status: CertificateStatus) => {
    if (status === "revoked") {
      return <span className="text-sm text-muted-foreground">not valid</span>
    }

    switch (validity) {
      case "valid":
        return <span className="text-sm text-emerald-400 font-mono">{daysUntil} days left</span>
      case "expiring":
        return <span className="text-sm text-amber-400 font-mono">{daysUntil} days left</span>
      case "expired":
        return <span className="text-sm text-zinc-400 font-mono">{Math.abs(daysUntil)} days ago</span>
    }
  }

  const getStatusBadge = (status: CertificateStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs">Active</Badge>
      case "inactive":
        return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-mono text-xs">Inactive</Badge>
      case "revoked":
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-mono text-xs">Revoked</Badge>
    }
  }

  const getHSMBadge = (hsm: string | undefined) => {
    if (!hsm) {
      return <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-mono text-xs">N/A</Badge>
    }
    
    const normalizedHsm = hsm.toLowerCase()
    const config: Record<string, { label: string; className: string }> = {
      'spbe': { label: 'Klavis-SPBE', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
      'iiv': { label: 'Klavis-IIV', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      'thales': { label: 'Thales-Luna', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      'luna': { label: 'Thales-Luna', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    }
    
    const matchedKey = Object.keys(config).find(key => normalizedHsm.includes(key))
    const hsmConfig = matchedKey ? config[matchedKey] : { label: hsm, className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
    
    return (
      <Badge variant="outline" className={`font-mono text-xs ${hsmConfig.className}`}>
        {hsmConfig.label}
      </Badge>
    )
  }

  const getFilesStatus = (cert: Certificate) => {
    const files = [
      { name: "CSR", value: cert.csr_encrypted },
      { name: "CRT", value: cert.crt_encrypted },
      { name: "KEY", value: cert.key_encrypted },
    ]

    const existingFiles = files.filter((f) => f.value && f.value.trim() !== "")
    const missingFiles = files.filter((f) => !f.value || f.value.trim() === "")

    return (
      <div className="flex gap-1.5 flex-wrap">
        {existingFiles.map((file) => (
          <Badge
            key={file.name}
            className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-0 text-xs"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {file.name}
          </Badge>
        ))}
        {missingFiles.map((file) => (
          <Badge key={file.name} className="bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/20 border-0 text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            {file.name}
          </Badge>
        ))}
      </div>
    )
  }

  const hasLongCertificateId = paginatedCerts.some(cert => cert.app_id_label === 'TANGERANGKOTACS01')
  
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by App ID Label..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 w-full"
            />
          </div>
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
            </SelectContent>
          </Select>
          <Select
            value={validityFilter}
            onValueChange={(value) => {
              setValidityFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Validity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Validity</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '180px', flexShrink: 0 }} />
              <col style={{ width: '120px', flexShrink: 0 }} />
              <col style={{ width: '120px', flexShrink: 0 }} />
              <col style={{ width: '130px', flexShrink: 0 }} />
              <col style={{ width: '180px', flexShrink: 0 }} />
              <col style={{ width: '140px', flexShrink: 0 }} />
              <col style={{ width: '100px', flexShrink: 0 }} />
            </colgroup>
            <thead className="bg-muted/30 border-y border-border/30 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('app_id_label')} className="flex items-center gap-1 hover:text-foreground">
                    Certificate ID <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('created_date')} className="flex items-center gap-1 hover:text-foreground">
                    Created <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('expired_date')} className="flex items-center gap-1 hover:text-foreground">
                    Expired <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  HSM
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Files
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('validity')} className="flex items-center gap-1 hover:text-foreground">
                    Validity <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCerts.map((cert) => {
                const validity = getValidityStatus(cert.expired_date)
                const status = getCertificateStatus(cert.expired_date, cert.revoked_app_status)
                const daysUntil = getDaysUntilExpiry(cert.expired_date)
                const files = [
                  { name: "CSR", value: cert.csr_encrypted },
                  { name: "CRT", value: cert.crt_encrypted },
                  { name: "KEY", value: cert.key_encrypted },
                ]
                const existingFiles = files.filter((f) => f.value && f.value.trim() !== "")
                const missingFiles = files.filter((f) => !f.value || f.value.trim() === "")

                return (
                  <tr key={cert.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">{cert.app_id_label}</td>
                    <td className="p-3 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">{formatDate(cert.created_date)}</td>
                    <td className="p-3 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">{formatDate(cert.expired_date)}</td>
                    <td className="p-3 overflow-hidden text-ellipsis">{getHSMBadge(cert.hsm)}</td>
                    <td className="p-3 overflow-hidden">
                      <div className="flex gap-1.5 flex-wrap">
                        {existingFiles.map((file) => (
                          <Badge key={file.name} variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {file.name}
                          </Badge>
                        ))}
                        {missingFiles.map((file) => (
                          <Badge key={file.name} variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 overflow-hidden text-ellipsis">{getValidityBadge(validity, daysUntil, status)}</td>
                    <td className="p-3 overflow-hidden text-ellipsis whitespace-nowrap">{getStatusBadge(status)}</td>
                  </tr>
                )
              })}
              {emptyRowsArray.map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-border/20">
                  <td colSpan={7} className="p-3" />
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
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedCerts.length)} of {filteredAndSortedCerts.length}
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
