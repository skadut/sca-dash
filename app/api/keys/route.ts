import { NextResponse } from 'next/server'
import type { Key } from '@/lib/types'
import { mockKeys } from '@/lib/mock-key-data'

const mockKeysForAPI: Key[] = mockKeys

// Database query function - only works when deployed to Vercel
async function fetchFromDatabase(): Promise<Key[] | null> {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env

  if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    return null // Missing env vars, use mock data
  }

  try {
    // Dynamic import to avoid loading postgres in v0 preview
    const postgres = (await import('postgres')).default
    const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

    const sql = postgres(connectionString, {
      ssl: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })

    const result = await sql`
      SELECT id, nama_instansi, nama_aplikasi, deskripsi_aplikasi,
        id_login, id_aplikasi, hash_id_apikasi, partisi_number, partisi_label,
        key_id, key_label, key_lifetime,
        TO_CHAR(key_created, 'YYYY/MM/DD') as key_created,
        TO_CHAR(key_expired, 'YYYY/MM/DD') as key_expired,
        secret_id, secret_label, secret_data,
        created_at::text, updated_at::text, revoked_key_status, hsm
      FROM key_test 
      ORDER BY created_at DESC
    `

    await sql.end()
    return result as Key[]
  } catch (error) {
    console.error('Database connection error:', error)
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
        keys: mockKeysForAPI,
        isUsingMockData: true,
        message: 'Using mock data',
      })
    }

    // Mode is database - try to fetch from database
    const dbKeys = await fetchFromDatabase()

    if (dbKeys) {
      return NextResponse.json({
        keys: dbKeys,
        isUsingMockData: false,
        message: 'Connected to PostgreSQL database',
      })
    }

    // Database connection failed, return error with mock data fallback
    return NextResponse.json({
      keys: mockKeysForAPI,
      isUsingMockData: true,
      connectionFailed: true,
      message: 'Database connection failed - deploy to Vercel with env vars to connect',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keys', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
