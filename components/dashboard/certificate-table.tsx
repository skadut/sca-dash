"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import type { Certificate, CertificateStatus, ValidityStatus } from "@/lib/types"
import { formatDate, getValidityStatus, getCertificateStatus, getDaysUntilExpiry } from "@/lib/certificate-utils"
import { Search, ArrowUpDown, Filter, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface CertificateTableProps {
  certificates: Certificate[]
}

type SortField = "app_id_label" | "created_date" | "expired_date" | "hsm"
type SortDirection = "asc" | "desc"

export function CertificateTable({ certificates }: CertificateTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<CertificateStatus | "all">("all")
  const [hsmFilter, setHsmFilter] = useState<"all" | "SPBE" | "IIV">("all")
  const [filesFilter, setFilesFilter] = useState<string[]>([])
  const [validityFilter, setValidityFilter] = useState<"all" | "active" | "expiring" | "not-valid" | "expired">("all")
  const [sortField, setSortField] = useState<SortField>("expired_date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(10)

  const filteredAndSortedCerts = useMemo(() => {
    let result = [...certificates]

    // Filter by search
    if (search) {
      result = result.filter((cert) => cert.app_id_label.toLowerCase().includes(search.toLowerCase()))
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (cert) => getCertificateStatus(cert.expired_date, cert.revoked_app_status) === statusFilter,
      )
    }

    if (hsmFilter !== "all") {
      result = result.filter((cert) => cert.hsm && cert.hsm.toUpperCase() === hsmFilter)
    }

    if (filesFilter.length > 0) {
      result = result.filter((cert) => {
        return filesFilter.every((filter) => {
          if (filter === "CSR") return cert.csr_encrypted && cert.csr_encrypted.trim() !== ""
          if (filter === "CRT") return cert.crt_encrypted && cert.crt_encrypted.trim() !== ""
          if (filter === "KEY") return cert.key_encrypted && cert.key_encrypted.trim() !== ""
          return true
        })
      })
    }

    if (validityFilter !== "all") {
      result = result.filter((cert) => {
        const status = getCertificateStatus(cert.expired_date, cert.revoked_app_status)
        const validity = getValidityStatus(cert.expired_date)

        if (validityFilter === "active") return validity === "valid" && status === "active"
        if (validityFilter === "expiring") return validity === "expiring"
        if (validityFilter === "not-valid") return status === "revoked"
        if (validityFilter === "expired") return validity === "expired"
        return true
      })
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === "app_id_label") {
        comparison = a.app_id_label.localeCompare(b.app_id_label)
      } else if (sortField === "hsm") {
        const aHsm = a.hsm || ""
        const bHsm = b.hsm || ""
        comparison = aHsm.localeCompare(bHsm)
      } else {
        comparison = a[sortField].localeCompare(b[sortField])
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [certificates, search, statusFilter, hsmFilter, filesFilter, validityFilter, sortField, sortDirection])

  const paginatedCerts = useMemo(() => {
    if (itemsPerPage === "all") {
      return filteredAndSortedCerts
    }
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedCerts.slice(startIndex, endIndex)
  }, [filteredAndSortedCerts, currentPage, itemsPerPage])

  const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(filteredAndSortedCerts.length / itemsPerPage)

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleFileFilter = (file: string) => {
    setFilesFilter((prev) => {
      if (prev.includes(file)) {
        return prev.filter((f) => f !== file)
      } else {
        return [...prev, file]
      }
    })
    handleFilterChange()
  }

  const getValidityBadge = (validity: ValidityStatus, daysUntil: number, status: CertificateStatus) => {
    if (status === "revoked") {
      return <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/20 border-0">not valid</Badge>
    }

    switch (validity) {
      case "valid":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-0">
            {daysUntil} days left
          </Badge>
        )
      case "expiring":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 border-0">{daysUntil} days left</Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/20 border-0">
            {Math.abs(daysUntil)} days ago
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: CertificateStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-0">Active</Badge>
      case "inactive":
        return <Badge className="bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/20 border-0">Inactive</Badge>
      case "revoked":
        return <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/20 border-0">Revoked</Badge>
    }
  }

  const getHSMBadge = (hsm: string | undefined) => {
    if (!hsm) {
      return <Badge className="bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/20 border-0">N/A</Badge>
    }
    const hsmUpper = hsm.toUpperCase()
    if (hsmUpper === "SPBE") {
      return <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/20 border-0">SPBE</Badge>
    } else if (hsmUpper === "IIV") {
      return <Badge className="bg-purple-500/15 text-purple-600 hover:bg-purple-500/20 border-0">IIV</Badge>
    }
    return <Badge className="bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/20 border-0">{hsm}</Badge>
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

  const displayRows = useMemo(() => {
    if (itemsPerPage === "all") {
      return paginatedCerts
    }
    // Fill empty slots with null to maintain fixed table height
    const rows: (Certificate | null)[] = [...paginatedCerts]
    while (rows.length < itemsPerPage) {
      rows.push(null)
    }
    return rows
  }, [paginatedCerts, itemsPerPage])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by App ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  handleFilterChange()
                }}
                className="pl-9 w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as CertificateStatus | "all")
                handleFilterChange()
              }}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={hsmFilter}
              onValueChange={(value) => {
                setHsmFilter(value as "all" | "SPBE" | "IIV")
                handleFilterChange()
              }}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="HSM Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All HSM</SelectItem>
                <SelectItem value="SPBE">SPBE</SelectItem>
                <SelectItem value="IIV">IIV</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px] justify-start bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Files {filesFilter.length > 0 && `(${filesFilter.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-3" align="start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
              <Checkbox
                id="csr_encrypted"
                checked={filesFilter.includes("CSR")}
                onCheckedChange={(checked) => {
                  setFilesFilter(
                    checked ? [...filesFilter, "CSR"] : filesFilter.filter((f) => f !== "CSR"),
                  )
                  setCurrentPage(1)
                }}
              />
              <label htmlFor="csr_encrypted" className="text-sm font-medium leading-none cursor-pointer">
                      Has CSR
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="crt"
                      checked={filesFilter.includes("CRT")}
                      onCheckedChange={() => toggleFileFilter("CRT")}
                    />
                    <label htmlFor="crt" className="text-sm font-medium leading-none cursor-pointer">
                      Has CRT
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="key"
                      checked={filesFilter.includes("KEY")}
                      onCheckedChange={() => toggleFileFilter("KEY")}
                    />
                    <label htmlFor="key" className="text-sm font-medium leading-none cursor-pointer">
                      Has KEY
                    </label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Select
              value={validityFilter}
              onValueChange={(value) => {
                setValidityFilter(value as "all" | "active" | "expiring" | "not-valid" | "expired")
                handleFilterChange()
              }}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Validity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Validity</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="not-valid">Not Valid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort("app_id_label")}
                  >
                    Cert
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort("created_date")}
                  >
                    Date Created
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort("expired_date")}
                  >
                    Expired Date
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => handleSort("hsm")}
                  >
                    HSM
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">Files</TableHead>
                <TableHead className="font-semibold">Validity</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No certificates found.
                  </TableCell>
                </TableRow>
              ) : (
                displayRows.map((cert, index) => {
                  if (!cert) {
                    // Empty row to maintain fixed height
                    return (
                      <TableRow key={`empty-${index}`} className="hover:bg-transparent h-12">
                        <TableCell className="py-2">&nbsp;</TableCell>
                        <TableCell className="py-2">&nbsp;</TableCell>
                        <TableCell className="py-2">&nbsp;</TableCell>
                        <TableCell className="py-2">&nbsp;</TableCell>
                        <TableCell className="py-2">&nbsp;</TableCell>
                        <TableCell className="py-2">&nbsp;</TableCell>
                        <TableCell className="py-2">&nbsp;</TableCell>
                      </TableRow>
                    )
                  }

                  const validity = getValidityStatus(cert.expired_date)
                  const status = getCertificateStatus(cert.expired_date, cert.revoked_app_status)
                  const daysUntil = getDaysUntilExpiry(cert.expired_date)
                  return (
                    <TableRow key={cert.id} className="hover:bg-muted/30 h-12">
                      <TableCell className="font-mono text-sm font-medium py-2">{cert.app_id_label}</TableCell>
                      <TableCell className="text-muted-foreground py-2">
                        <span className="text-xs text-muted-foreground/60 mr-2">{cert.created_date}</span>
                        {formatDate(cert.created_date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2">
                        <span className="text-xs text-muted-foreground/60 mr-2">{cert.expired_date}</span>
                        {formatDate(cert.expired_date)}
                      </TableCell>
                      <TableCell className="py-2">{getHSMBadge(cert.hsm)}</TableCell>
                      <TableCell className="py-2">{getFilesStatus(cert)}</TableCell>
                      <TableCell className="py-2">{getValidityBadge(validity, daysUntil, status)}</TableCell>
                      <TableCell className="py-2">{getStatusBadge(status)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              {itemsPerPage === "all"
                ? filteredAndSortedCerts.length
                : Math.min(paginatedCerts.length, filteredAndSortedCerts.length)}{" "}
              of {filteredAndSortedCerts.length} certificates
            </p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(value === "all" ? "all" : Number.parseInt(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {itemsPerPage !== "all" && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
