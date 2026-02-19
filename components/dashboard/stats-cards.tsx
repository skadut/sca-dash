"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Certificate } from "@/lib/types"
import { getValidityStatus, getCertificateStatus } from "@/lib/certificate-utils"
import { ShieldCheck, ShieldAlert, ShieldX, Ban, FileText } from "lucide-react"

interface StatsCardsProps {
  certificates: Certificate[]
}

export function StatsCards({ certificates }: StatsCardsProps) {
  const total = certificates.length
  const active = certificates.filter(
    (c) => getCertificateStatus(c.expired_date, c.revoked_app_status) === "active",
  ).length
  const inactive = certificates.filter(
    (c) => getCertificateStatus(c.expired_date, c.revoked_app_status) === "inactive",
  ).length
  const revoked = certificates.filter(
    (c) => getCertificateStatus(c.expired_date, c.revoked_app_status) === "revoked",
  ).length
  const expiringSoon = certificates.filter(
    (c) =>
      getValidityStatus(c.expired_date) === "expiring" &&
      getCertificateStatus(c.expired_date, c.revoked_app_status) === "active",
  ).length

  const stats = [
    {
      label: "Certificates",
      value: total,
      sublabel: "Generated Certificate",
      icon: FileText,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      glowColor: "text-cyan-400",
      animated: false,
    },
    {
      label: "Active",
      value: active,
      subtitle: "Currently in use",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      glowColor: "text-emerald-400",
      animated: true,
    },
    {
      label: "Expiring Soon",
      value: expiringSoon,
      subtitle: "Within 90 days",
      icon: ShieldAlert,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      glowColor: "text-amber-400",
      animated: true,
    },
    {
      label: "Inactive",
      value: inactive,
      subtitle: "Expired certificates",
      icon: ShieldX,
      iconColor: "text-zinc-400",
      iconBg: "bg-zinc-500/10",
      glowColor: "text-zinc-400",
      animated: false,
    },
    {
      label: "Revoked",
      value: revoked,
      subtitle: "Access denied",
      icon: Ban,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      glowColor: "text-red-400",
      animated: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className="border-border/30 bg-card/50 backdrop-blur stat-card-hover group overflow-hidden relative"
        >
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground font-sans uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className={`p-2.5 rounded-lg ${stat.iconBg} backdrop-blur-sm`}>
                  <stat.icon 
                    className={`h-5 w-5 ${stat.iconColor} ${stat.animated ? 'animate-pulse-glow' : ''}`} 
                  />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold font-mono ${stat.iconColor} tracking-tight`}>
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.change && (
                    <span className="text-sm font-semibold text-emerald-400 font-mono">
                      {stat.change}
                    </span>
                  )}
                </div>
                {stat.sublabel && <p className="text-xs text-muted-foreground mt-2 font-sans">{stat.sublabel}</p>}
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-2 font-sans">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <div 
            className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.iconBg}`}
          />
        </Card>
      ))}
    </div>
  )
}
