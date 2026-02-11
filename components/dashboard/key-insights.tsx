"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Trophy, TrendingUp } from "lucide-react"
import type { Key } from "@/lib/types"

interface KeyInsightsProps {
  keys: Key[]
}

export function KeyInsights({ keys }: KeyInsightsProps) {
  // Get top 4 most recent keys - sorted by created_date column
  const recentKeys = [...keys]
    .sort((a, b) => parseInt(b.created_date) - parseInt(a.created_date))
    .slice(0, 4)

  // Get top 4 institutions by key count
  const instansiCounts = keys.reduce((acc, key) => {
    const name = key.nama_instansi
    if (!acc[name]) {
      acc[name] = { count: 0, keys: [] }
    }
    acc[name].count++
    acc[name].keys.push(key)
    return acc
  }, {} as Record<string, { count: number; keys: Key[] }>)

  const topInstansi = Object.entries(instansiCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 4)
    .map(([name, data], index) => ({
      rank: index + 1,
      name,
      count: data.count,
      keys: data.keys,
    }))

  const getHsmColor = (hsm: string): { badge: string; avatarIndex: number } => {
    const normalized = hsm?.toLowerCase() || ''
    if (normalized.includes('klavis-spbe')) {
      return { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', avatarIndex: 0 }
    } else if (normalized.includes('klavis-iiv')) {
      return { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', avatarIndex: 1 }
    } else if (normalized.includes('thales-luna')) {
      return { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', avatarIndex: 2 }
    }
    return { badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', avatarIndex: 3 }
  }

  const getTimeAgo = (dateStr: string): string => {
    // Parse YYYYMMDD format
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1 // JavaScript months are 0-indexed
    const day = parseInt(dateStr.substring(6, 8))
    
    const date = new Date(year, month, day)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (index: number): string => {
    const colors = [
      'bg-cyan-500/20 text-cyan-400',
      'bg-purple-500/20 text-purple-400',
      'bg-emerald-500/20 text-emerald-400',
      'bg-amber-500/20 text-amber-400',
      'bg-blue-500/20 text-blue-400',
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Keys */}
      <Card className="border-border/50 bg-card flex flex-col">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Key Created
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest activity</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 flex-1 overflow-y-auto">
          {recentKeys.map((key) => {
            const hsmColor = getHsmColor(key.hsm)
            return (
              <div
                key={key.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(hsmColor.avatarIndex)}`}>
                  {getInitials(key.nama_aplikasi)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{key.nama_aplikasi}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {key.id_login} • {getTimeAgo(key.created_date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="outline" className={`${hsmColor.badge} text-xs whitespace-nowrap`}>
                    {key.hsm}
                  </Badge>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Top Institutions */}
      <Card className="border-border/50 bg-card flex flex-col">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Top Institution
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Most keys generated</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 flex-1 overflow-y-auto">
          {topInstansi.map((item) => {
            const percentage = ((item.count / keys.length) * 100).toFixed(0)
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
                    {item.count} {item.count === 1 ? 'key' : 'keys'}
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
