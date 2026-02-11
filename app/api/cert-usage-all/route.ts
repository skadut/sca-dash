import { NextResponse } from 'next/server'
import { mockACLData } from '@/lib/mock-acl-data'

export async function GET(request: Request) {
  try {
    // Return mock data for cert-usage-all endpoint
    // This is the same data used by the ACL endpoint
    return NextResponse.json({
      data: mockACLData.data,
      isUsingMockData: true,
      message: 'Certificate usage data',
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
