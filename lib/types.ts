export interface Certificate {
  id: number
  app_id_label: string
  created_date: string // YYYYMMDD format
  expired_date: string // YYYYMMDD format
  revoked_app_status: boolean
  hsm: string // Added hsm column (SPBE or IIV)
  csr_encrypted?: string | null
  crt_encrypted?: string | null
  key_encrypted?: string | null
}

export interface Key {
  id: number
  nama_instansi: string
  nama_aplikasi: string
  deskripsi_aplikasi: string
  id_login: string
  id_aplikasi: string
  hash_id_apikasi: string
  partisi_number: number
  partisi_label: string
  key_id: string
  key_label: string
  key_lifetime: number // days
  key_created: string // yyyy/mm/dd
  key_expired: string // yyyy/mm/dd
  secret_id: string
  secret_label: string
  secret_data: string
  created_date: string // YYYYMMDD format
  created_at: string
  updated_at: string
  revoked_key_status: boolean
  hsm: 'klavis-spbe' | 'klavis-iiv' | 'thales-luna'
}

export interface Notification {
  id: string
  type: "insert" | "update"
  message: string
  timestamp: Date
  read: boolean
}

export type CertificateStatus = "active" | "inactive" | "revoked"
export type ValidityStatus = "valid" | "expiring" | "expired"
export type KeyStatus = "active" | "expired" | "revoked"

export interface CertificateUsage {
  nama_instansi: string
  nama_aplikasi: string
}

export interface CertificateUsageData {
  [certificateId: string]: CertificateUsage[]
}
