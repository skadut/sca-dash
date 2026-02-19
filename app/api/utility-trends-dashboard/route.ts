import { NextResponse } from 'next/server'
import https from 'https'
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

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<UtilityTrendsResponse | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for utility trends API')
    return null
  }

  try {
    // Parse the URL to extract hostname (remove protocol if present)
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    // Remove trailing slash if present
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching utility trends from:', `${hostname}:${ACL_API_PORT}/utility-trends-dashboard`)
    console.log('[v0] Certificate verification:', TLS_VERIFY !== 'false' ? 'enabled' : 'disabled')

    // Helper function to decode certificate - handles both PEM and base64 formats
    const decodeCert = (certData: string): string => {
      // If it already looks like PEM (contains -----BEGIN), return as-is
      if (certData.includes('-----BEGIN')) {
        return certData
      }
      // Otherwise, decode from base64
      try {
        return Buffer.from(certData, 'base64').toString('utf-8')
      } catch {
        return certData // Return original if decode fails
      }
    }

    // Use native https module for mTLS support
    return new Promise((resolve) => {
      const caCert = decodeCert(TLS_CA_CERT)
      const clientCert = decodeCert(TLS_CERT)
      const clientKey = decodeCert(TLS_KEY)

      // Log certificate presence (not the actual content for security)
      console.log('[v0] CA cert loaded:', caCert.length > 0 ? 'yes' : 'no')
      console.log('[v0] Client cert loaded:', clientCert.length > 0 ? 'yes' : 'no')
      console.log('[v0] Client key loaded:', clientKey.length > 0 ? 'yes' : 'no')

      const options: any = {
        hostname: hostname,
        port: parseInt(ACL_API_PORT),
        path: '/utility-trends-dashboard',
        method: 'GET',
        ca: caCert,
        cert: clientCert,
        key: clientKey,
        // Set rejectUnauthorized based on TLS_VERIFY env var (default: true)
        rejectUnauthorized: TLS_VERIFY !== 'false',
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data)
              console.log('[v0] Utility trends data fetched successfully from API')
              resolve(jsonData as UtilityTrendsResponse)
            } catch (parseError) {
              console.error('[v0] Error parsing utility trends response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Utility trends API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Utility trends API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Utility trends API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up utility trends request:', error)
    return null
  }
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'database'

    // If mode is mock, return mock data directly
    if (mode === 'mock') {
      const mockTrends = calculateTrends()
      return NextResponse.json({
        ...mockTrends,
        isUsingMockData: true,
        message: 'Using mock data',
      })
    }

    // Mode is database - try to fetch from external API
    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        ...apiData,
        isUsingMockData: false,
        message: 'Connected to external utility trends API',
      })
    }

    // API connection failed, return mock data fallback
    const mockTrends = calculateTrends()
    return NextResponse.json({
      ...mockTrends,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Utility trends API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch utility trends', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
