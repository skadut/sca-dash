import { NextResponse } from 'next/server'
import https from 'https'
import type { Certificate, Key } from '@/lib/types'
import { mockCertificates } from '@/lib/mock-data'
import { mockKeys } from '@/lib/mock-key-data'

interface CertificateAvailability {
  csr_avail: number
  crt_avail: number
  key_avail: number
  total_cert: number
}

interface KeySecret {
  key_with_secret: number
  key_without_secret: number
}

interface CertAvailKeySecretResponse {
  certificate_availability: CertificateAvailability
  key_secret: KeySecret
}

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<CertAvailKeySecretResponse | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for certavail-keysecret API')
    return null
  }

  try {
    let hostname = ACL_API_URL
    if (hostname.includes('://')) {
      hostname = hostname.split('://')[1]
    }
    hostname = hostname.replace(/\/$/, '')

    console.log('[v0] Fetching certavail-keysecret from:', `${hostname}:${ACL_API_PORT}/certavail-keysecret-dashboard`)
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
        path: '/certavail-keysecret-dashboard',
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
              console.log('[v0] Certificate availability & key-secret data fetched successfully from API')
              resolve(jsonData as CertAvailKeySecretResponse)
            } catch (parseError) {
              console.error('[v0] Error parsing certavail-keysecret response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] Certavail-keysecret API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] Certavail-keysecret API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] Certavail-keysecret API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up certavail-keysecret request:', error)
    return null
  }
}

function calculateMockData(): CertAvailKeySecretResponse {
  // Calculate certificate availability
  const csrCount = mockCertificates.filter((c) => c.csr_data && c.csr_data.trim() !== '').length
  const crtCount = mockCertificates.filter((c) => c.crt_data && c.crt_data.trim() !== '').length
  const keyCount = mockCertificates.filter((c) => c.key_data && c.key_data.trim() !== '').length
  const totalCert = mockCertificates.length

  // Calculate key-secret relationship
  const keyWithSecret = mockKeys.filter((k) => k.secret_data && k.secret_data.trim() !== '').length
  const keyWithoutSecret = mockKeys.length - keyWithSecret

  return {
    certificate_availability: {
      csr_avail: csrCount,
      crt_avail: crtCount,
      key_avail: keyCount,
      total_cert: totalCert,
    },
    key_secret: {
      key_with_secret: keyWithSecret,
      key_without_secret: keyWithoutSecret,
    },
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'database'

    // If mode is mock, return mock data directly
    if (mode === 'mock') {
      const mockData = calculateMockData()
      return NextResponse.json({
        ...mockData,
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
        message: 'Connected to external certavail-keysecret API',
      })
    }

    // API connection failed, return mock data fallback
    const mockData = calculateMockData()
    return NextResponse.json({
      ...mockData,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] Certavail-keysecret API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certavail-keysecret data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
