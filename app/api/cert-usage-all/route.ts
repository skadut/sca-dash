import { NextResponse } from 'next/server'
import https from 'https'
import { mockACLData } from '@/lib/mock-acl-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    console.log(`[v0] Fetching certificates with limit=${limit}, page=${page}`)

    const acl_api_url = process.env.ACL_API_URL
    const acl_api_port = process.env.ACL_API_PORT
    const tls_cert = process.env.TLS_CERT
    const tls_key = process.env.TLS_KEY
    const tls_ca_cert = process.env.TLS_CA_CERT

    // Try backend API first if all TLS env vars are present
    if (acl_api_url && acl_api_port && tls_cert && tls_key && tls_ca_cert) {
      console.log('[v0] Attempting backend connection for cert-usage-all')

      try {
        const backendData = await new Promise((resolve, reject) => {
          const hostname = acl_api_url.replace(/^https?:\/\//, '')
          
          const options = {
            hostname: hostname,
            port: parseInt(acl_api_port),
            path: `/cert-usage-all?limit=${limit}&page=${page}`,
            method: 'GET',
            cert: tls_cert,
            key: tls_key,
            ca: tls_ca_cert,
            rejectUnauthorized: false,
          }

          const req = https.request(options, (res) => {
            let data = ''
            res.on('data', (chunk) => { data += chunk })
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data)
                resolve(parsed)
              } catch (e) {
                reject(new Error('Invalid JSON from backend'))
              }
            })
          })

          req.on('error', (error) => {
            reject(error)
          })

          req.setTimeout(5000, () => {
            req.destroy()
            reject(new Error('Backend request timeout'))
          })

          req.end()
        })

        console.log('[v0] Backend API success for cert-usage-all')
        console.log('[v0] Backend response keys:', Object.keys(backendData))
        
        // Handle different backend response formats
        let certificateData = []
        let totalCount = 0
        
        if (Array.isArray(backendData)) {
          // Backend returns raw array
          certificateData = backendData
          totalCount = backendData.length
        } else if (backendData.data) {
          // Backend returns { data: [...], total_certs_integrated: 13 } structure
          certificateData = Array.isArray(backendData.data) ? backendData.data : []
          // Use total_certs_integrated if available, otherwise use total or fallback to data length
          totalCount = backendData.total_certs_integrated || backendData.total || certificateData.length
        } else {
          // Fallback
          certificateData = []
          totalCount = 0
        }
        
        console.log(`[v0] Backend API returning: ${certificateData.length} items out of ${totalCount} total (total_certs_integrated available: ${'total_certs_integrated' in backendData})`)
        
        // Return properly structured response - preserve all backend fields
        const responseData = {
          data: certificateData,
          total: totalCount,
          total_certs_integrated: backendData.total_certs_integrated || totalCount,
          limit: limit,
          page: page,
          isUsingMockData: false,
        }
        
        return NextResponse.json(responseData)
      } catch (err) {
        console.log('[v0] Backend API error, using mock data:', err instanceof Error ? err.message : err)
      }
    } else {
      console.log('[v0] Missing backend credentials, using mock data')
    }

    // Fallback to paginated mock data
    const certArray = Array.isArray(mockACLData?.data) ? mockACLData.data : Array.isArray(mockACLData) ? mockACLData : []
    const total = certArray.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = certArray.slice(startIndex, endIndex)

    console.log(`[v0] Returning mock data: ${paginatedData.length} items out of ${total} total`)

    return NextResponse.json({
      data: paginatedData,
      total: total,
      limit: limit,
      page: page,
      isUsingMockData: true,
      message: 'Certificate usage data (mock)',
    })
  } catch (error) {
    console.error('[v0] Cert usage all API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch certificate usage data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
