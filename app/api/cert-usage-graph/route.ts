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

export async function GET(request: Request) {
  try {
    const acl_api_url = process.env.ACL_API_URL
    const acl_api_port = process.env.ACL_API_PORT
    const tls_cert = process.env.TLS_CERT
    const tls_key = process.env.TLS_KEY
    const tls_ca_cert = process.env.TLS_CA_CERT

    console.log('[v0] Cert-usage-graph endpoint called')

    // Try backend API first
    if (acl_api_url && acl_api_port && tls_cert && tls_key && tls_ca_cert) {
      console.log('[v0] Attempting to fetch from backend API:', `${acl_api_url}:${acl_api_port}/cert-usage-graph`)

      return await new Promise((resolve) => {
        const options = {
          hostname: acl_api_url,
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
              const parsed = JSON.parse(data)
              console.log('[v0] Backend API returned successfully')
              resolve(NextResponse.json(parsed))
            } catch (e) {
              console.error('[v0] Failed to parse backend response:', e)
              fallbackToMockData()
            }
          })
        })

        req.on('error', (err) => {
          console.error('[v0] Backend API connection failed:', err.message)
          fallbackToMockData()
        })

        req.end()
      })
    } else {
      console.log('[v0] Missing required environment variables for cert-usage-graph API')
      return fallbackToMockData()
    }

    function fallbackToMockData() {
      console.log('[v0] Using mock data for cert-usage-graph')
      
      // Transform mock ACL data into cert usage graph format
      const certArray = Array.isArray(mockACLData?.data) ? mockACLData.data : Array.isArray(mockACLData) ? mockACLData : []
      
      // Group by institution and count applications
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
      
      // Convert to array and sort by application count (descending)
      const data = Array.from(institutionMap.values())
        .sort((a, b) => b.total_applications - a.total_applications)
        .slice(0, 10)
      
      return NextResponse.json({
        data,
        isUsingMockData: true,
        message: 'Using mock data - backend API not configured',
        status: 'success',
      })
    }
  } catch (error) {
    console.error('[v0] Error in cert-usage-graph:', error)
    return NextResponse.json(
      { error: 'Internal server error', isUsingMockData: true },
      { status: 500 }
    )
  }
}
