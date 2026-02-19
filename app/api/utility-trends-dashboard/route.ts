import { NextResponse } from 'next/server'
import { mockKeys } from '@/lib/mock-key-data'
import { mockCertificates } from '@/lib/mock-data'

interface MonthlyData {
  month: string
  keys: number
  certificates: number
}

interface UtilityTrendsResponse {
  total_keys: number
  total_msk: number
  total_secret: number
  total_certificates: number
  avg_keys_month: number
  avg_certs_month: number
  monthly: MonthlyData[]
}

function getMonthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

function calculateTrends(): UtilityTrendsResponse {
  // Get the last 6 months
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Initialize months array
  const monthsMap = new Map<string, MonthlyData>()
  for (let i = 0; i < 6; i++) {
    const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1)
    const monthKey = getMonthName(date)
    monthsMap.set(monthKey, { month: monthKey, keys: 0, certificates: 0 })
  }

  // Count keys by month
  let totalKeys = 0
  let totalMsk = 0
  let totalSecret = 0

  mockKeys.forEach((key) => {
    totalKeys++
    if (key.key_label && key.key_label.toUpperCase().includes('MSK')) {
      totalMsk++
    }
    if (key.secret_data && key.secret_data.trim() !== '') {
      totalSecret++
    }

    if (key.created_at) {
      const date = new Date(key.created_at)
      if (date >= sixMonthsAgo && date <= now) {
        const monthKey = getMonthName(date)
        const monthData = monthsMap.get(monthKey)
        if (monthData) {
          monthData.keys++
        }
      }
    }
  })

  // Count certificates by month
  let totalCertificates = 0
  mockCertificates.forEach((cert) => {
    totalCertificates++

    if (cert.created_date) {
      // Parse date from YYYYMMDD format or similar
      const yearStr = cert.created_date.substring(0, 4)
      const monthStr = cert.created_date.substring(4, 6)
      const dayStr = cert.created_date.substring(6, 8)

      const dateStr = `${yearStr}-${monthStr}-${dayStr}`
      const date = new Date(dateStr)

      if (date >= sixMonthsAgo && date <= now) {
        const monthKey = getMonthName(date)
        const monthData = monthsMap.get(monthKey)
        if (monthData) {
          monthData.certificates++
        }
      }
    }
  })

  const monthly = Array.from(monthsMap.values())
  const avgKeysMonth = monthly.length > 0 ? Number((totalKeys / 6).toFixed(1)) : 0
  const avgCertsMonth = monthly.length > 0 ? Number((totalCertificates / 6).toFixed(1)) : 0

  return {
    total_keys: totalKeys,
    total_msk: totalMsk,
    total_secret: totalSecret,
    total_certificates: totalCertificates,
    avg_keys_month: avgKeysMonth,
    avg_certs_month: avgCertsMonth,
    monthly,
  }
}

export async function GET() {
  try {
    const trends = calculateTrends()
    return NextResponse.json(trends)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch utility trends', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
