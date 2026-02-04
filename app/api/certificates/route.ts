import { NextResponse } from "next/server"
import type { Certificate } from "@/lib/types"
import { mockCertificates } from "@/lib/mock-data"

const mockCertificatesForAPI: Certificate[] = mockCertificates

// Database query function - only works when deployed to Vercel
async function fetchFromDatabase(): Promise<Certificate[] | null> {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env

  if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    return null // Missing env vars, use mock data
  }

  try {
    // Dynamic import to avoid loading postgres in v0 preview
    const postgres = (await import("postgres")).default
    const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

    const sql = postgres(connectionString, {
      ssl: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })

    const result = await sql`
      SELECT id, app_id_label, 
        TO_CHAR(created_date, 'YYYYMMDD') as created_date, 
        TO_CHAR(expired_date, 'YYYYMMDD') as expired_date,
        revoked_app_status,
        hsm,
        csr_encrypted,
        crt_encrypted,
        key_encrypted
      FROM cert_test 
      ORDER BY created_date DESC
    `

    await sql.end()
    return result as Certificate[]
  } catch (error) {
    console.error("Database connection error:", error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode") || "mock"

    // If mode is mock, return mock data directly
    if (mode === "mock") {
      return NextResponse.json({
        certificates: mockCertificatesForAPI,
        isUsingMockData: true,
        message: "Using mock data",
      })
    }

    // Mode is database - try to fetch from database
    const dbCertificates = await fetchFromDatabase()

    if (dbCertificates) {
      return NextResponse.json({
        certificates: dbCertificates,
        isUsingMockData: false,
        message: "Connected to PostgreSQL database",
      })
    }

    // Database connection failed, return error with mock data fallback
    return NextResponse.json({
      certificates: mockCertificatesForAPI,
      isUsingMockData: true,
      connectionFailed: true,
      message: "Database connection failed - deploy to Vercel with env vars to connect",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch certificates", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
