"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Trophy, TrendingUp } from "lucide-react"

interface RecentKeyData {
  key_id: string
  nama_instansi: string
  nama_aplikasi: string
  hsm: string
  recent_day: number
}

interface TopInstitutionData {
  nama_instansi: string
  msk_count: number
  secret_count: number
  total_keys: number
  percentage: number
}

export function KeyInsights() {
  const [recentKeys, setRecentKeys] = useState<RecentKeyData[]>([])
  const [topInstitutions, setTopInstitutions] = useState<TopInstitutionData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from both endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [recentRes, institutionRes] = await Promise.all([
          fetch('/api/key-recent-top4'),
          fetch('/api/key-instansi-top4')
        ])

        if (recentRes.ok) {
          const recentData = await recentRes.json()
          setRecentKeys(recentData.data || [])
        }

        if (institutionRes.ok) {
          const institutionData = await institutionRes.json()
          setTopInstitutions(institutionData.data || [])
        }
      } catch (err) {
        console.error('[v0] Failed to fetch key insights data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const getTimeAgo = (recentDay: number): string => {
    if (recentDay === 0) return 'Today'
    if (recentDay === 1) return 'Yesterday'
    return `${recentDay} days ago`
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
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : recentKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent keys</p>
          ) : (
            recentKeys.map((key) => {
              const hsmColor = getHsmColor(key.hsm)
              return (
                <div
                  key={key.key_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(hsmColor.avatarIndex)}`}>
                    {getInitials(key.nama_aplikasi)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{key.nama_aplikasi}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {key.nama_instansi} • {getTimeAgo(key.recent_day)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="outline" className={`${hsmColor.badge} text-xs whitespace-nowrap`}>
                      {key.hsm}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
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
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : topInstitutions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No institution data</p>
          ) : (
            topInstitutions.map((item, index) => (
              <div
                key={item.nama_instansi}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                    {getInitials(item.nama_instansi)}
                  </div>
                  {index < 3 && (
                    <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      index === 0 ? 'bg-amber-500' :
                      index === 1 ? 'bg-zinc-400' :
                      'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{item.nama_instansi}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.total_keys} {item.total_keys === 1 ? 'key' : 'keys'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm font-semibold text-foreground">{item.total_keys}</p>
                  <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +{item.percentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
