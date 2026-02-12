'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertCircle } from 'lucide-react'
import type { Certificate } from '@/lib/types'
import { getCertificateStatus, getValidityStatus, getDaysUntilExpiry } from '@/lib/certificate-utils'

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
  // Parse date string in format YYYYMMDD or ISO format
  let date: Date
  
  if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
    // Format: YYYYMMDD
    const year = parseInt(dateString.substring(0, 4))
    const month = parseInt(dateString.substring(4, 6)) - 1 // Month is 0-indexed
    const day = parseInt(dateString.substring(6, 8))
    date = new Date(year, month, day)
  } else {
    // Try to parse as ISO or other format
    date = new Date(dateString)
  }
  
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

const getHealthBarColor = (daysUntilExpiry: number): string => {
  if (daysUntilExpiry < 30) {
    return 'bg-red-600'
  }
  if (daysUntilExpiry < 90) {
    return 'bg-amber-500'
  }
  return 'bg-emerald-500'
}

const getCertificateStageType = (daysUntilExpiry: number): 'critical' | 'warning' | 'safe' => {
  if (daysUntilExpiry < 30) {
    return 'critical'
  }
  if (daysUntilExpiry < 90) {
    return 'warning'
  }
  return 'safe'
}

const getHealthPercentage = (daysUntilExpiry: number, maxDays: number = 365): number => {
  // Calculate remaining health as a percentage of max validity
  const percentage = Math.max(0, Math.min(100, (daysUntilExpiry / maxDays) * 100))
  return percentage
}

export function CertificateInsights({ certificates }: CertificateInsightsProps) {
  // Get top 4 most recent certificates
  const recentCerts = [...certificates]
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, 4)

  // Get active certificates nearing expiration, sorted by most imminent
  const certificateStages = certificates
    .filter(cert => getCertificateStatus(cert.expired_date, cert.revoked_app_status) === 'active')
    .map(cert => {
      const daysUntilExpiry = getDaysUntilExpiry(cert.expired_date)
      return {
        ...cert,
        daysUntilExpiry,
        stageType: getCertificateStageType(daysUntilExpiry),
      }
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .slice(0, 4)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Certificates */}
      <Card className="border-border/50 bg-card flex flex-col min-h-[420px] overflow-hidden">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Certificate Created
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest activity</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden pb-0">
          {recentCerts.map((cert) => {
            const hsmColor = getHsmColor(cert.hsm)
            return (
              <div
                key={cert.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(hsmColor.avatarIndex)}`}>
                  {getInitials(cert.app_id_label)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{cert.app_id_label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getTimeAgo(cert.created_date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="outline" className={`${hsmColor.badge} text-xs whitespace-nowrap`}>
                    {cert.hsm}
                  </Badge>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Certificate Stages - Health Bar View */}
      <Card className="border-border/50 bg-card flex flex-col min-h-[420px] overflow-hidden">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Certificate Stages
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Validity health status</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 flex-1 overflow-y-auto pb-0">
          {certificateStages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active certificates</p>
          ) : (
            certificateStages.map((cert, index) => {
              const healthColor = getHealthBarColor(cert.daysUntilExpiry)
              const healthPercentage = getHealthPercentage(cert.daysUntilExpiry)
              const statusLabel = cert.stageType === 'critical' ? 'Critical' : cert.stageType === 'warning' ? 'Warning' : 'Safe'
              
              return (
                <div
                  key={cert.id}
                  className="health-bar-item p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Certificate Name and Status */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="font-medium text-sm text-foreground truncate">{cert.app_id_label}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium flex-shrink-0 ${
                        cert.stageType === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        cert.stageType === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                  
                  {/* Health Bar Container */}
                  <div className="flex items-center gap-2.5">
                    {/* Health Bar */}
                    <div className="flex-1 h-2 bg-red-900/40 rounded-full overflow-hidden">
                      <div
                        className={`health-bar-animated h-full ${healthColor} rounded-full`}
                        style={{ 
                          width: `${healthPercentage}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
                    
                    {/* Days Left Label */}
                    <span className="text-sm font-mono font-semibold text-foreground whitespace-nowrap flex-shrink-0 min-w-[55px] text-right">
                      {cert.daysUntilExpiry} days
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
