import { NextResponse } from 'next/server'
import https from 'https'
import { mockACLData } from '@/lib/mock-acl-data'

interface CertUsageGraphEntry {
  id_login: string
  nama_instansi: string
  total_applications: number
  applications: string[]
  total_msk: number
  total_secret: number
  total_keys: number
}

export async function GET() {
  try {
    const aclApiUrl = process.env.ACL_API_URL
    const aclApiPort = process.env.ACL_API_PORT
    const aclCertPath = process.env.ACL_CERT_PATH
    const aclKeyPath = process.env.ACL_KEY_PATH

    // If using mock data or API credentials not configured, return mock data
    if (!aclApiUrl || !aclApiPort || !aclCertPath || !aclKeyPath) {
      console.log('[v0] Using mock data for cert-usage-graph (API credentials not configured)')

      // Transform mock data into graph format
      const certArray = Array.isArray(mockACLData?.data) ? mockACLData.data : []
      const graphData: CertUsageGraphEntry[] = []

      // Group by institution
      const institutionMap = new Map<string, CertUsageGraphEntry>()

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
          if (!instData.applications.includes(cert.app_id_label)) {
            instData.applications.push(cert.app_id_label)
            instData.total_applications = instData.applications.length
          }
        })
      })

      const dataArray = Array.from(institutionMap.values())
        .sort((a, b) => b.total_applications - a.total_applications)
        .slice(0, 10)

      return NextResponse.json({
        data: dataArray,
        status: 'success',
        isUsingMockData: true,
      })
    }

    // Fetch from actual backend API with mTLS
    const options: https.RequestOptions = {
      hostname: aclApiUrl,
      port: parseInt(aclApiPort),
      path: '/cert-usage-graph',
      method: 'GET',
      cert: process.env.ACL_CLIENT_CERT || '',
      key: process.env.ACL_CLIENT_KEY || '',
      ca: process.env.ACL_CA_CERT || '',
      rejectUnauthorized: true,
    }

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data)
            const topData = Array.isArray(parsedData.data)
              ? parsedData.data.sort((a: any, b: any) => b.total_applications - a.total_applications).slice(0, 10)
              : []

            resolve(
              NextResponse.json({
                data: topData,
                status: parsedData.status || 'success',
              })
            )
          } catch (error) {
            console.error('[v0] Error parsing cert-usage-graph response:', error)
            resolve(
              NextResponse.json({
                data: [],
                status: 'error',
                message: 'Failed to parse API response',
              })
            )
          }
        })
      })

      req.on('error', (error) => {
        console.error('[v0] Error fetching cert-usage-graph:', error)
        resolve(
          NextResponse.json({
            data: [],
            status: 'error',
            message: 'Failed to fetch from API',
          })
        )
      })

      req.end()
    })
  } catch (error) {
    console.error('[v0] Error in cert-usage-graph route:', error)
    return NextResponse.json(
      {
        data: [],
        status: 'error',
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
