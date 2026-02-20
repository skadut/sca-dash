import { NextResponse } from 'next/server'
import https from 'https'
import { mockKeys } from '@/lib/mock-key-data'

interface KeySummaryResponse {
  all_keys: number
  all_secret: number
  all_msk: number
  active: number
  expiring_soon: number
  inactive: number
  revoked: number
  isUsingMockData?: boolean
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<KeySummaryResponse | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for key summary API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching key summary from:', `${hostname}:${ACL_API_PORT}/key-summary`)

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
        path: '/key-summary',
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
              console.log('[v0] Key summary data fetched successfully from API')
              resolve(jsonData as KeySummaryResponse)
            } catch (parseError) {
              console.error('[v0] Error parsing key summary response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Key summary API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Key summary API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Key summary API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up key summary request:', error)
    return null
  }
}

function calculateKeyStats(): KeySummaryResponse {
  const total = mockKeys.length
  const withSecret = mockKeys.filter((k) => k.secret_data && k.secret_data.trim() !== '').length
  const withoutSecret = total - withSecret
  const msk = mockKeys.filter((k) => k.key_label && k.key_label.toUpperCase().includes('MSK')).length

  return {
    all_keys: total,
    all_secret: withSecret,
    all_msk: msk,
    active: Math.max(0, total - 5),
    expiring_soon: 2,
    inactive: 0,
    revoked: 0,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'database'

    // If mode is mock, return mock data directly
    if (mode === 'mock') {
      const mockStats = calculateKeyStats()
      return NextResponse.json({
        ...mockStats,
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
        message: 'Connected to external key summary API',
      })
    }

    // API connection failed, return mock data fallback
    const mockStats = calculateKeyStats()
    return NextResponse.json({
      ...mockStats,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Key summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch key summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
