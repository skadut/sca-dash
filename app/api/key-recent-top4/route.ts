import { NextResponse } from 'next/server'
import https from 'https'
import { mockKeys } from '@/lib/mock-key-data'

interface RecentKeyData {
  key_id: string
  nama_instansi: string
  nama_aplikasi: string
  hsm: string
  recent_day: number
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<{ data: RecentKeyData[]; status: string; total: number } | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for key recent API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching key recent from:', `${hostname}:${ACL_API_PORT}/key-recent-top4`)

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

      const options: any = {
        hostname: hostname,
        port: parseInt(ACL_API_PORT),
        path: '/key-recent-top4',
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
              console.log('[v0] Key recent data fetched successfully from API')
              resolve(jsonData)
            } catch (parseError) {
              console.error('[v0] Error parsing key recent response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Key recent API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Key recent API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Key recent API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up key recent request:', error)
    return null
  }
}

function getRecentKeysMock(): RecentKeyData[] {
  const now = new Date()
  const recentData = mockKeys
    .filter(k => k.key_id && k.nama_instansi && k.nama_aplikasi && k.hsm)
    .slice(0, 4)
    .map((key, index) => {
      const keyDate = new Date(key.created_at || new Date())
      const diffTime = Math.abs(now.getTime() - keyDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return {
        key_id: key.key_id,
        nama_instansi: key.nama_instansi,
        nama_aplikasi: key.nama_aplikasi,
        hsm: key.hsm || 'Unknown',
        recent_day: Math.min(diffDays, 365),
      }
    })
  return recentData
}

export async function GET(request: Request) {
  try {
    // Always try to fetch from external API first
    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        data: apiData.data,
        status: 'success',
        total: apiData.total || apiData.data.length,
        isUsingMockData: false,
      })
    }

    // API connection failed, return mock data fallback
    const mockData = getRecentKeysMock()
    return NextResponse.json({
      data: mockData,
      status: 'success',
      total: mockData.length,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Key recent API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent keys', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
