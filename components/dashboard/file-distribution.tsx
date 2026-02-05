"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { Certificate } from "@/lib/types"
import { FileText, Package, Key } from "lucide-react"

interface FileDistributionProps {
  certificates: Certificate[]
}

export function FileDistribution({ certificates }: FileDistributionProps) {
  // Count certificates with each file type
  const withCSR = certificates.filter((c) => c.csr_encrypted).length
  const withCRT = certificates.filter((c) => c.crt_encrypted).length
  const withKEY = certificates.filter((c) => c.key_encrypted).length
  const total = certificates.length

  const data = [
    { 
      name: "CSR", 
      available: withCSR, 
      missing: total - withCSR,
      total: total,
      color: "#06b6d4" 
    },
    { 
      name: "CRT", 
      available: withCRT, 
      missing: total - withCRT,
      total: total,
      color: "#10b981" 
    },
    { 
      name: "KEY", 
      available: withKEY, 
      missing: total - withKEY,
      total: total,
      color: "#C9D115" 
    },
  ]

  const stats = [
    {
      label: "With CSR",
      value: withCSR,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "With CRT",
      value: withCRT,
      icon: Package,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "With KEY",
      value: withKEY,
      icon: Key,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.fill }}>
              {entry.dataKey === 'available' ? 'Available' : 'Missing'}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Certificate File Availability</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Overview of CSR, CRT, and KEY file availability</p>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              type="number" 
              style={{ fontSize: 14, fontWeight: 600 }}
              className="fill-foreground"
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              style={{ fontSize: 14, fontWeight: 600 }}
              className="fill-foreground"
              width={60} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="available" stackId="a" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="missing" stackId="a" fill="#52525b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* File Availability Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">CSR Available</p>
            <p className="text-sm font-semibold mt-1 text-foreground">
              {withCSR} / {certificates.length}
            </p>
            <div className="mt-2 w-full bg-muted rounded h-1.5">
              <div
                className="bg-cyan-500 h-1.5 rounded transition-all"
                style={{ width: `${(withCSR / certificates.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">CRT Available</p>
            <p className="text-sm font-semibold mt-1 text-foreground">
              {withCRT} / {certificates.length}
            </p>
            <div className="mt-2 w-full bg-muted rounded h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded transition-all"
                style={{ width: `${(withCRT / certificates.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">KEY Available</p>
            <p className="text-sm font-semibold mt-1 text-foreground">
              {withKEY} / {certificates.length}
            </p>
            <div className="mt-2 w-full bg-muted rounded h-1.5">
              <div
                className="h-1.5 rounded transition-all"
                style={{ width: `${(withKEY / certificates.length) * 100}%`, backgroundColor: "#C9D115" }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
