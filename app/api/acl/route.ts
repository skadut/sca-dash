import { NextResponse } from 'next/server'
import https from 'https'
import type { CertificateRelations } from '@/lib/types'
import { mockACLData } from '@/lib/mock-acl-data'

// Fetch from external API with mTLS
async function fetchFromExternalAPI(): Promise<CertificateRelations | null> {
  const { ACL_API_URL, ACL_API_PORT, TLS_CA_CERT, TLS_CERT, TLS_KEY } = process.env

  if (!ACL_API_URL || !ACL_API_PORT || !TLS_CA_CERT || !TLS_CERT || !TLS_KEY) {
    console.log('[v0] Missing required environment variables for ACL API')
    return null
  }

  try {
    console.log('[v0] Fetching ACL data from:', `${ACL_API_URL}:${ACL_API_PORT}/cert-related-all`)

    // Use native https module for mTLS support
    return new Promise((resolve, reject) => {
      const options = {
        hostname: ACL_API_URL,
        port: parseInt(ACL_API_PORT),
        path: '/cert-related-all',
        method: 'GET',
        ca: Buffer.from(TLS_CA_CERT, 'base64'),
        cert: Buffer.from(TLS_CERT, 'base64'),
        key: Buffer.from(TLS_KEY, 'base64'),
        rejectUnauthorized: true,
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
              console.log('[v0] ACL data fetched successfully')
              resolve(jsonData as CertificateRelations)
            } catch (parseError) {
              console.error('[v0] Error parsing ACL response:', parseError)
              resolve(null)
            }
          } else {
            console.error('[v0] ACL API response not ok:', res.statusCode)
            resolve(null)
          }
        })
      })

      req.on('error', (error) => {
        console.error('[v0] Error fetching ACL data:', error)
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
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'mock'

    // If mode is mock, return mock data directly
    if (mode === 'mock') {
      return NextResponse.json({
        data: mockACLData,
        isUsingMockData: true,
        message: 'Using mock data',
      })
    }

    // Mode is database - try to fetch from external API
    const apiData = await fetchFromExternalAPI()

    if (apiData) {
      return NextResponse.json({
        data: apiData,
        isUsingMockData: false,
        message: 'Connected to external ACL API',
      })
    }

    // API connection failed, return mock data fallback
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
