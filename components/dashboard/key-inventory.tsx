'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Key } from '@/lib/types'
import { KeyRound, ShieldCheck, ShieldX, Ban, Server, Clock } from 'lucide-react'

interface KeyInventoryStatsProps {
  keys: Key[]
}

export function KeyInventoryStats({ keys }: KeyInventoryStatsProps) {
  const total = keys.length
  const active = keys.filter((k) => {
    const expired = new Date(k.key_expired.replace(/\//g, '-')) < new Date()
    return !k.revoked_key_status && !expired
  }).length
  const expired = keys.filter((k) => {
    const expiredDate = new Date(k.key_expired.replace(/\//g, '-')) < new Date()
    return expiredDate && !k.revoked_key_status
  }).length
  const revoked = keys.filter((k) => k.revoked_key_status).length
  const expiringSoon = keys.filter((k) => {
    const expiryDate = new Date(k.key_expired.replace(/\//g, '-'))
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30 && !k.revoked_key_status
  }).length

  const stats = [
    {
      label: 'Keys',
      value: total,
      sublabel: 'Generated Key',
      icon: KeyRound,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      animated: false,
    },
    {
      label: 'Active',
      value: active,
      subtitle: 'Currently in use',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      animated: true,
    },
    {
      label: 'Expiring Soon',
      value: expiringSoon,
      subtitle: 'Within 30 days',
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      animated: true,
    },
    {
      label: 'Expired',
      value: expired,
      subtitle: 'Past expiration date',
      icon: ShieldX,
      iconColor: 'text-zinc-400',
      iconBg: 'bg-zinc-500/10',
      animated: false,
    },
    {
      label: 'Revoked',
      value: revoked,
      subtitle: 'Access denied',
      icon: Ban,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
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
                <p className="text-sm text-muted-foreground font-sans uppercase tracking-wide">{stat.label}</p>
                <div className={`p-2.5 rounded-lg ${stat.iconBg} backdrop-blur-sm`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor} ${stat.animated ? 'animate-pulse-glow' : ''}`} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold font-mono ${stat.iconColor} tracking-tight`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                {stat.sublabel && <p className="text-xs text-muted-foreground mt-2 font-sans">{stat.sublabel}</p>}
                {stat.subtitle && <p className="text-xs text-muted-foreground mt-2 font-sans">{stat.subtitle}</p>}
              </div>
            </div>
          </CardContent>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.iconBg}`} />
        </Card>
      ))}
    </div>
  )
}
