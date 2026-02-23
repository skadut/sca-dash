import { NextResponse } from 'next/server'
import https from 'https'

interface MonthlyEntry {
  year: number
  month: number
  total_key_created: number
  total_msk_created: number
  total_secret_created: number
}

interface YearlyEntry {
  year: number
  total_key_created: number
  total_msk_created: number
  total_secret_created: number
}

interface KeyCreatedSummaryResponse {
  monthly: MonthlyEntry[]
  yearly: YearlyEntry[]
  isUsingMockData?: boolean
}

// Mock data generator
function generateMockData(): KeyCreatedSummaryResponse {
  const monthly: MonthlyEntry[] = []
  const yearly: Record<number, YearlyEntry> = {}

  // Generate mock data for 2024-2026
  for (let year = 2024; year <= 2026; year++) {
    yearly[year] = { year, total_key_created: 0, total_msk_created: 0, total_secret_created: 0 }

    for (let month = 1; month <= 12; month++) {
      const total_key_created = Math.floor(Math.random() * 50)
      const total_msk_created = Math.floor(total_key_created / 2)
      const total_secret_created = total_key_created - total_msk_created

      monthly.push({
        year,
        month,
        total_key_created,
        total_msk_created,
        total_secret_created,
      })

      yearly[year].total_key_created += total_key_created
      yearly[year].total_msk_created += total_msk_created
      yearly[year].total_secret_created += total_secret_created
    }
  }

  return {
    monthly,
    yearly: Object.values(yearly),
  }
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<KeyCreatedSummaryResponse | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for key-created-summary API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching key-created-summary from:', `${hostname}:${ACL_API_PORT}/key-created-summary`)
    console.log('[v0] Certificate verification:', TLS_VERIFY !== 'false' ? 'enabled' : 'disabled')

    const decodeCert = (certData: string): string => {
      if (certData.includes('-----BEGIN')) {
        return certData
      }
      try {
        return Buffer.from(certData, 'base64').toString('utf-8')
      } catch {
        return certData
      }
    }

    return new Promise((resolve) => {
      const caCert = decodeCert(TLS_CA_CERT)
      const clientCert = decodeCert(TLS_CERT)
      const clientKey = decodeCert(TLS_KEY)

      console.log('[v0] CA cert loaded:', caCert.length > 0 ? 'yes' : 'no')
      console.log('[v0] Client cert loaded:', clientCert.length > 0 ? 'yes' : 'no')
      console.log('[v0] Client key loaded:', clientKey.length > 0 ? 'yes' : 'no')

      const options: any = {
        hostname: hostname,
        port: parseInt(ACL_API_PORT),
        path: '/key-created-summary',
        method: 'GET',
        ca: caCert,
        cert: clientCert,
        key: clientKey,
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
              console.log('[v0] Key-created-summary data fetched successfully from API')
              resolve(jsonData as KeyCreatedSummaryResponse)
            } catch (parseError) {
              console.error('[v0] Error parsing key-created-summary response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Key-created-summary API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Key-created-summary API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Key-created-summary API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up key-created-summary request:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'database'

    if (mode === 'mock') {
      const mockData = generateMockData()
      return NextResponse.json({
        ...mockData,
        isUsingMockData: true,
        message: 'Using mock data',
      })
    }

    // Try to fetch from external API
    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        ...apiData,
        isUsingMockData: false,
        message: 'Connected to external key-created-summary API',
      })
    }

    // API connection failed, return mock data fallback
    const mockData = generateMockData()
    return NextResponse.json({
      ...mockData,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Key-created-summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch key-created-summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
