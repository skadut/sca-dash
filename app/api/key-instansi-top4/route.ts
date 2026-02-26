import { NextResponse } from 'next/server'
import https from 'https'
import { mockKeys } from '@/lib/mock-key-data'

interface TopInstitutionData {
  nama_instansi: string
  msk_count: number
  secret_count: number
  total_keys: number
  percentage: number
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<{ data: TopInstitutionData[]; status: string; total: number } | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for key instansi API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching key instansi from:', `${hostname}:${ACL_API_PORT}/key-instansi-top4`)

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
        path: '/key-instansi-top4',
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
              console.log('[v0] Key instansi data fetched successfully from API')
              resolve(jsonData)
            } catch (parseError) {
              console.error('[v0] Error parsing key instansi response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Key instansi API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Key instansi API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Key instansi API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up key instansi request:', error)
    return null
  }
}

function getTopInstitutionsMock(): TopInstitutionData[] {
  // Group keys by institution
  const instansiMap = new Map<string, { msk: number; secret: number; total: number }>()

  mockKeys.forEach(key => {
    if (!instansiMap.has(key.nama_instansi)) {
      instansiMap.set(key.nama_instansi, { msk: 0, secret: 0, total: 0 })
    }

    const inst = instansiMap.get(key.nama_instansi)!
    inst.total++

    if (key.key_label?.toUpperCase().includes('MSK')) {
      inst.msk++
    }
    if (key.secret_label) {
      inst.secret++
    }
  })

  // Convert to array and sort by total keys
  const topInstitutions = Array.from(instansiMap.entries())
    .map(([nama_instansi, data]) => ({
      nama_instansi,
      msk_count: data.msk,
      secret_count: data.secret,
      total_keys: data.total,
      percentage: 0,
    }))
    .sort((a, b) => b.total_keys - a.total_keys)
    .slice(0, 4)

  // Calculate percentages
  const totalKeys = mockKeys.length
  return topInstitutions.map(inst => ({
    ...inst,
    percentage: parseFloat(((inst.total_keys / totalKeys) * 100).toFixed(2)),
  }))
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
    const mockData = getTopInstitutionsMock()
    return NextResponse.json({
      data: mockData,
      status: 'success',
      total: mockData.length,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Key instansi API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top institutions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
