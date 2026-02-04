import type { CertificateStatus, ValidityStatus } from "./types"

export function parseDate(dateStr: string): Date {
  const year = Number.parseInt(dateStr.substring(0, 4))
  const month = Number.parseInt(dateStr.substring(4, 6)) - 1
  const day = Number.parseInt(dateStr.substring(6, 8))
  return new Date(year, month, day)
}

export function formatDate(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getValidityStatus(expiredDate: string): ValidityStatus {
  const today = new Date()
  const expiry = parseDate(expiredDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return "expired"
  if (daysUntilExpiry <= 30) return "expiring"
  return "valid"
}

export function getCertificateStatus(expiredDate: string, revokedAppStatus: boolean): CertificateStatus {
  // If revoked_app_status is true, status is "revoked"
  if (revokedAppStatus) return "revoked"

  // If key is expired, status is "inactive"
  const today = new Date()
  const expiry = parseDate(expiredDate)
  if (expiry < today) return "inactive"

  // Otherwise, status is "active"
  return "active"
}

export function getDaysUntilExpiry(expiredDate: string): number {
  const today = new Date()
  const expiry = parseDate(expiredDate)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
