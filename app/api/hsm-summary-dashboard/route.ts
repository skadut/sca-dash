import { NextResponse } from 'next/server'
import https from 'https'
import { mockKeys } from '@/lib/mock-key-data'
import { mockCertificates } from '@/lib/mock-data'

interface HSMData {
  hsm: string
  keys: number
  certificates: number
}

interface HSMSummaryResponse {
  data: HSMData[]
  status: string
  total_certificates: number
  total_hsm: number
  total_keys: number
  total_msk: number
  total_secret: number
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<HSMSummaryResponse | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for HSM summary API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching HSM summary from:', `${hostname}:${ACL_API_PORT}/hsm-summary-dashboard`)
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
        path: '/hsm-summary-dashboard',
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
              console.log('[v0] HSM summary data fetched successfully from API')
              resolve(jsonData as HSMSummaryResponse)
            } catch (parseError) {
              console.error('[v0] Error parsing HSM summary response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] HSM summary API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] HSM summary API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] HSM summary API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up HSM summary request:', error)
    return null
  }
}

function calculateHSMSummary(): HSMSummaryResponse {
  // Calculate HSM type distribution from mock data
  const hsmTypes = new Set([
    ...mockCertificates.map((c) => c.hsm || 'Unknown'),
    ...mockKeys.map((k) => k.hsm || 'Unknown'),
  ])

  const data: HSMData[] = Array.from(hsmTypes).map((hsm) => {
    const certCount = mockCertificates.filter((c) => (c.hsm || 'Unknown') === hsm).length
    const keyCount = mockKeys.filter((k) => (k.hsm || 'Unknown') === hsm).length

    return {
      hsm: hsm as string,
      keys: keyCount,
      certificates: certCount,
    }
  })

  const totalKeys = mockKeys.length
  const totalCerts = mockCertificates.length
  const totalMsk = mockKeys.filter((k) => k.key_label && k.key_label.toUpperCase().includes('MSK')).length
  const totalSecret = mockKeys.filter((k) => k.secret_data && k.secret_data.trim() !== '').length

  return {
    data,
    status: 'success',
    total_certificates: totalCerts,
    total_hsm: hsmTypes.size,
    total_keys: totalKeys,
    total_msk: totalMsk,
    total_secret: totalSecret,
  }
}

export async function GET() {
  try {
    // Try to fetch from external API
    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        ...apiData,
        isUsingMockData: false,
        message: 'Connected to external HSM summary API',
      })
    }

    // API connection failed, return mock data fallback
    const mockSummary = calculateHSMSummary()
    return NextResponse.json({
      ...mockSummary,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] HSM summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HSM summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
