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
      color: "#f59e0b" 
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

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Certificate File Availability</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Overview of CSR, CRT, and KEY file availability</p>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={60} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              formatter={(value, name) => [value, name === 'available' ? 'Available' : 'Missing']}
            />
            <Bar dataKey="available" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="missing" stackId="a" fill="#3f3f46" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* File Availability Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">CSR Available</p>
            <p className="text-sm font-semibold mt-1">
              {withCSR} / {certificates.length}
            </p>
            <div className="mt-2 w-full bg-muted rounded h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded transition-all"
                style={{ width: `${(withCSR / certificates.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">CRT Available</p>
            <p className="text-sm font-semibold mt-1">
              {withCRT} / {certificates.length}
            </p>
            <div className="mt-2 w-full bg-muted rounded h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded transition-all"
                style={{ width: `${(withCRT / certificates.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">KEY Available</p>
            <p className="text-sm font-semibold mt-1">
              {withKEY} / {certificates.length}
            </p>
            <div className="mt-2 w-full bg-muted rounded h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded transition-all"
                style={{ width: `${(withKEY / certificates.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
