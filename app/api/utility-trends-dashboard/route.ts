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

async function calculateTrends(): Promise<UtilityTrendsResponse> {
  // Check if database connection is available
  const databaseUrl = process.env.DATABASE_URL

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

  if (databaseUrl) {
    // Database mode - query from Neon
    try {
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(databaseUrl)

      // Query total keys and count by type
      const keysResult = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN key_label ILIKE '%MSK%' THEN 1 ELSE 0 END) as msk_count,
          SUM(CASE WHEN secret_data IS NOT NULL AND secret_data != '' THEN 1 ELSE 0 END) as secret_count
        FROM key_test
      `

      const totalKeys = Number(keysResult[0]?.total) || 0
      const totalMsk = Number(keysResult[0]?.msk_count) || 0
      const totalSecret = Number(keysResult[0]?.secret_count) || 0

      // Query keys by month for last 6 months
      const keysByMonth = await sql`
        SELECT 
          TO_CHAR(created_at, 'Mon YYYY') as month_key,
          COUNT(*) as count
        FROM key_test
        WHERE created_at >= ${sixMonthsAgo.toISOString()}
        GROUP BY TO_CHAR(created_at, 'Mon YYYY')
        ORDER BY created_at
      `

      // Query total certificates
      const certsResult = await sql`
        SELECT COUNT(*) as total
        FROM certificate
      `

      const totalCertificates = Number(certsResult[0]?.total) || 0

      // Query certificates by month for last 6 months
      const certsByMonth = await sql`
        SELECT 
          TO_CHAR(TO_DATE(created_date, 'YYYYMMDD'), 'Mon YYYY') as month_key,
          COUNT(*) as count
        FROM certificate
        WHERE TO_DATE(created_date, 'YYYYMMDD') >= ${sixMonthsAgo.toISOString()}
        GROUP BY TO_CHAR(TO_DATE(created_date, 'YYYYMMDD'), 'Mon YYYY')
        ORDER BY TO_DATE(created_date, 'YYYYMMDD')
      `

      // Populate monthly data
      keysByMonth.forEach((row: any) => {
        const monthData = monthsMap.get(row.month_key)
        if (monthData) {
          monthData.keys = Number(row.count)
        }
      })

      certsByMonth.forEach((row: any) => {
        const monthData = monthsMap.get(row.month_key)
        if (monthData) {
          monthData.certificates = Number(row.count)
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
    } catch (error) {
      console.error('Database query error, falling back to mock data:', error)
      // Fall through to mock data
    }
  }

  // Mock mode - use mock data when database is not available
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
    const trends = await calculateTrends()
    return NextResponse.json(trends)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch utility trends', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
