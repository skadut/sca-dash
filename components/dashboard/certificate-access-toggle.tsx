'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CertificateInsights } from '@/components/dashboard/certificate-insights'
import { TrafficGraph } from '@/components/dashboard/traffic-graph'
import { BarChart3, Grid3x3 } from 'lucide-react'
import type { Certificate } from '@/lib/types'

interface CertificateAccessToggleProps {
  certificates: Certificate[]
}

export function CertificateAccessToggle({ certificates }: CertificateAccessToggleProps) {
  const [activeView, setActiveView] = useState<'overview' | 'traffic'>('overview')
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation on mount and when page changes
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Stage Progress Bar - Expanding Animation */}
      <div className="relative h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out ${
            isAnimating ? 'w-full' : 'w-12'
          }`}
          style={{
            boxShadow: isAnimating ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'none',
          }}
        />
      </div>

      {/* Toggle Switch - Modern Segmented Control */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="inline-flex w-full max-w-md rounded-lg bg-muted/50 p-1 mx-auto gap-1">
            {/* Overview Button */}
            <button
              onClick={() => {
                setActiveView('overview')
                setIsAnimating(true)
                setTimeout(() => setIsAnimating(false), 600)
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${
                activeView === 'overview'
                  ? 'bg-background text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              Overview
            </button>

            {/* Traffic Analysis Button */}
            <button
              onClick={() => {
                setActiveView('traffic')
                setIsAnimating(true)
                setTimeout(() => setIsAnimating(false), 600)
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${
                activeView === 'traffic'
                  ? 'bg-background text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Traffic Analysis
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections - Fixed Height with Smooth Transition */}
      <div className="relative h-full min-h-[600px] overflow-hidden">
        {/* Overview Section */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeView === 'overview'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-full pointer-events-none'
          }`}
        >
          <div className="space-y-6">
            <StatsCards certificates={certificates} />
            <CertificateInsights certificates={certificates} />
          </div>
        </div>

        {/* Traffic Analysis Section */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeView === 'traffic'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 -translate-x-full pointer-events-none'
          }`}
        >
          <TrafficGraph certificates={certificates} />
        </div>
      </div>
    </div>
  )
}
