import { NextResponse } from 'next/server'
import https from 'https'
import { mockACLData } from '@/lib/mock-acl-data'

interface CertUsageEntry {
  id_login: string
  nama_instansi: string
  total_applications: number
  applications: string[]
  total_msk: number
  total_secret: number
  total_keys: number
}

interface CertUsageGraphResponse {
  data: CertUsageEntry[]
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<CertUsageGraphResponse | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for cert-usage-graph API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching cert-usage-graph from:', `${hostname}:${ACL_API_PORT}/cert-usage-graph`)
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
        path: '/cert-usage-graph',
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
              console.log('[v0] Cert-usage-graph data fetched successfully from API')
              resolve({ data: jsonData } as CertUsageGraphResponse)
            } catch (parseError) {
              console.error('[v0] Error parsing cert-usage-graph response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Cert-usage-graph API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Cert-usage-graph API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Cert-usage-graph API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up cert-usage-graph request:', error)
    return null
  }
}

function transformMockDataToGraph(): CertUsageEntry[] {
  const certArray = Array.isArray(mockACLData?.data) ? mockACLData.data : Array.isArray(mockACLData) ? mockACLData : []
  const institutionMap = new Map<string, CertUsageEntry>()

  certArray.forEach((cert: any) => {
    if (!cert || !cert.used_by) return

    cert.used_by.forEach((app: any) => {
      const instName = app.nama_instansi
      if (!institutionMap.has(instName)) {
        institutionMap.set(instName, {
          id_login: '',
          nama_instansi: instName,
          total_applications: 0,
          applications: [],
          total_msk: 0,
          total_secret: 0,
          total_keys: 0,
        })
      }

      const instData = institutionMap.get(instName)!
      const appName = app.nama_aplikasi || cert.app_id_label
      if (!instData.applications.includes(appName)) {
        instData.applications.push(appName)
        instData.total_applications = instData.applications.length
      }
    })
  })

  return Array.from(institutionMap.values())
    .sort((a, b) => b.total_applications - a.total_applications)
    .slice(0, 10)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'database'

    if (mode === 'mock') {
      const mockData = transformMockDataToGraph()
      return NextResponse.json({
        data: mockData,
        isUsingMockData: true,
        message: 'Using mock data',
      })
    }

    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        data: apiData.data,
        isUsingMockData: false,
        message: 'Connected to external cert-usage-graph API',
      })
    }

    const mockData = transformMockDataToGraph()
    return NextResponse.json({
      data: mockData,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Cert-usage-graph API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cert-usage-graph', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
