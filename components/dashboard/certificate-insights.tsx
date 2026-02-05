'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Trophy, TrendingUp } from 'lucide-react'
import type { Certificate } from '@/lib/types'

interface CertificateInsightsProps {
  certificates: Certificate[]
}

const AVATAR_COLORS = [
  'bg-cyan-500/20 text-cyan-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-purple-500/20 text-purple-400',
]

const getAvatarColor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length]

const getInitials = (text: string) => {
  return text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function CertificateInsights({ certificates }: CertificateInsightsProps) {
  // Get top 4 most recent certificates
  const recentCerts = [...certificates]
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, 4)

  // Get top 4 certificates by app ID count
  const appIdCounts = certificates.reduce((acc, cert) => {
    const name = cert.app_id_label
    if (!acc[name]) {
      acc[name] = { count: 0, certs: [] }
    }
    acc[name].count++
    acc[name].certs.push(cert)
    return acc
  }, {} as Record<string, { count: number; certs: Certificate[] }>)

  const topAppIds = Object.entries(appIdCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 4)
    .map(([name, data], index) => ({
      rank: index + 1,
      name,
      count: data.count,
      certs: data.certs,
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Certificates */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Certificates
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest activity</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentCerts.map((cert, index) => (
            <div
              key={cert.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(index)}`}>
                {getInitials(cert.app_id_label)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{cert.app_id_label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {getTimeAgo(cert.created_date)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs whitespace-nowrap">
                  {cert.hsm}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Application IDs */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Top Application ID
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Most certificates</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {topAppIds.map((item) => {
            const percentage = ((item.count / certificates.length) * 100).toFixed(0)
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(item.rank - 1)}`}>
                    {getInitials(item.name)}
                  </div>
                  {item.rank <= 3 && (
                    <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      item.rank === 1 ? 'bg-amber-500' :
                      item.rank === 2 ? 'bg-zinc-400' :
                      'bg-amber-600'
                    }`}>
                      {item.rank}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'cert' : 'certs'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm font-semibold text-foreground">{item.count}</p>
                  <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +{percentage}%
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
