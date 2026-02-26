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

export async function GET(req: Request) {
  try {
    const acl_api_url = process.env.ACL_API_URL
    const acl_api_port = process.env.ACL_API_PORT
    const tls_cert = process.env.TLS_CERT
    const tls_key = process.env.TLS_KEY
    const tls_ca_cert = process.env.TLS_CA_CERT

    console.log('[v0] Cert-usage-graph API called')

    // Try backend API first if all TLS env vars are present
    if (acl_api_url && acl_api_port && tls_cert && tls_key && tls_ca_cert) {
      console.log('[v0] Attempting backend connection for cert-usage-graph')

      return await new Promise((resolve) => {
        // Strip protocol from hostname if present
        const hostname = acl_api_url.replace(/^https?:\/\//, '')
        
        const options = {
          hostname: hostname,
          port: parseInt(acl_api_port),
          path: '/cert-usage-graph',
          method: 'GET',
          cert: tls_cert,
          key: tls_key,
          ca: tls_ca_cert,
          rejectUnauthorized: false,
        }

        const req = https.request(options, (res) => {
          let data = ''

          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data)
              console.log('[v0] Backend API returned successfully for cert-usage-graph')
              console.log('[v0] Backend response structure:', {
                hasData: 'data' in parsedData,
                hasStats: 'stats' in parsedData,
                statsValue: parsedData.stats,
              })
              resolve(
                NextResponse.json({
                  data: parsedData.data || [],
                  stats: parsedData.stats || {
                    sum_cert_integrated: 0,
                    sum_institutions: 0,
                    sum_key_integrated: 0,
                  },
                  status: 'success',
                  connectionFailed: false,
                  isUsingMockData: false,
                })
              )
            } catch (parseErr) {
              console.log('[v0] Failed to parse backend response, using mock data')
              resolve(getMockDataResponse())
            }
          })
        })

        req.on('error', (err) => {
          console.log('[v0] Backend API error, using mock data:', err.message)
          resolve(getMockDataResponse())
        })

        req.end()
      })
    } else {
      console.log('[v0] Missing TLS environment variables, using mock data')
      return getMockDataResponse()
    }
  } catch (error) {
    console.error('[v0] Cert-usage-graph API error:', error)
    return getMockDataResponse()
  }
}

function getMockDataResponse() {
  try {
    const certArray = Array.isArray(mockACLData?.data) ? mockACLData.data : Array.isArray(mockACLData) ? mockACLData : []

    // Transform mock data to match API format
    const institutionMap = new Map<string, any>()
    let totalCertIntegrated = 0
    let totalKeyIntegrated = 0

    certArray.forEach((cert: any) => {
      if (!cert || !cert.used_by) return

      totalCertIntegrated += 1
      totalKeyIntegrated += cert.used_by.length

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
        if (!instData.applications.includes(app.nama_aplikasi || cert.app_id_label)) {
          instData.applications.push(app.nama_aplikasi || cert.app_id_label)
          instData.total_applications = instData.applications.length
        }
      })
    })

    // Convert to array and sort by total_applications descending
    const dataArray = Array.from(institutionMap.values()).sort(
      (a, b) => b.total_applications - a.total_applications
    )

    // Limit to top 10
    const topTen = dataArray.slice(0, 10)

    console.log('[v0] Mock data stats - certs:', totalCertIntegrated, 'institutions:', institutionMap.size, 'keys:', totalKeyIntegrated)

    return NextResponse.json({
      data: topTen,
      stats: {
        sum_cert_integrated: totalCertIntegrated,
        sum_institutions: institutionMap.size,
        sum_key_integrated: totalKeyIntegrated,
      },
      status: 'success',
      connectionFailed: false,
      isUsingMockData: true,
      limit: 10,
    })
  } catch (err) {
    console.error('[v0] Error transforming mock data:', err)
    return NextResponse.json({
      data: [],
      stats: {
        sum_cert_integrated: 0,
        sum_institutions: 0,
        sum_key_integrated: 0,
      },
      status: 'error',
      error: 'Failed to process data',
    })
  }
}
