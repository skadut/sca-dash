import { NextResponse } from 'next/server'
import https from 'https'
import type { CertificateUsageData } from '@/lib/types'
import { mockACLData } from '@/lib/mock-acl-data'

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<CertificateUsageData | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY, TLS_VERIFY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for ACL API')
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

    console.log('[v0] Fetching ACL data from:', `${hostname}:${ACL_API_PORT}/cert-usage-all`)
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
        path: '/cert-usage-all',
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
              console.log('[v0] ACL data fetched successfully from API')
              resolve(jsonData as CertificateUsageData)
            } catch (parseError) {
              console.error('[v0] Error parsing ACL response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] ACL API response status:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error: any) => {
        console.error('[v0] ACL API connection error:', error.code, error.message)
        resolve(null)
      })

      req.setTimeout(10000, () => {
        console.error('[v0] ACL API request timeout')
        req.destroy()
        resolve(null)
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error setting up ACL request:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    // Always try external API first, fall back to mock data if unavailable
    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        data: apiData,
        isUsingMockData: false,
        message: 'Connected to external ACL API',
      })
    }

    // API connection failed, return mock data as fallback
    return NextResponse.json({
      data: mockACLData,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'External API connection failed - using mock data fallback',
    })
  } catch (error) {
    console.error('[v0] ACL API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch ACL data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
