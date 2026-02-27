// Mock data for dashboard endpoints

export const mockKeySummary = {
  all_keys: 12,
  all_msk: 0,
  all_secret: 12,
  active: 7,
  expiring_soon: 2,
  inactive: 0,
  revoked: 0,
  isUsingMockData: true,
}

export const mockKeyCreatedSummary = {
  monthly: [
    { month: 1, total_key_created: 9, total_msk_created: 4, total_secret_created: 5, year: 2024 },
    { month: 2, total_key_created: 46, total_msk_created: 23, total_secret_created: 23, year: 2024 },
    { month: 3, total_key_created: 2, total_msk_created: 1, total_secret_created: 1, year: 2024 },
    { month: 4, total_key_created: 18, total_msk_created: 9, total_secret_created: 9, year: 2024 },
    { month: 5, total_key_created: 37, total_msk_created: 18, total_secret_created: 19, year: 2024 },
    { month: 6, total_key_created: 36, total_msk_created: 18, total_secret_created: 18, year: 2024 },
    { month: 7, total_key_created: 14, total_msk_created: 7, total_secret_created: 7, year: 2024 },
    { month: 8, total_key_created: 46, total_msk_created: 23, total_secret_created: 23, year: 2024 },
    { month: 9, total_key_created: 15, total_msk_created: 7, total_secret_created: 8, year: 2024 },
    { month: 10, total_key_created: 33, total_msk_created: 16, total_secret_created: 17, year: 2024 },
    { month: 11, total_key_created: 14, total_msk_created: 7, total_secret_created: 7, year: 2024 },
    { month: 12, total_key_created: 44, total_msk_created: 22, total_secret_created: 22, year: 2024 },
    { month: 1, total_key_created: 36, total_msk_created: 18, total_secret_created: 18, year: 2025 },
    { month: 2, total_key_created: 34, total_msk_created: 17, total_secret_created: 17, year: 2025 },
    { month: 3, total_key_created: 30, total_msk_created: 15, total_secret_created: 15, year: 2025 },
    { month: 4, total_key_created: 16, total_msk_created: 8, total_secret_created: 8, year: 2025 },
    { month: 5, total_key_created: 24, total_msk_created: 12, total_secret_created: 12, year: 2025 },
    { month: 6, total_key_created: 32, total_msk_created: 16, total_secret_created: 16, year: 2025 },
  ],
  total_keys: 586,
  total_msk: 0,
  total_secret: 586,
  isUsingMockData: true,
}

export const mockUtilityTrends = {
  total_keys: 12,
  total_msk: 0,
  total_secret: 12,
  total_certificates: 27,
  avg_keys_month: 2,
  avg_certs_month: 4.5,
  monthly: [
    { month: 'Sep 2025', keys: 0, certificates: 0 },
    { month: 'Oct 2025', keys: 1, certificates: 0 },
    { month: 'Nov 2025', keys: 0, certificates: 0 },
    { month: 'Dec 2025', keys: 1, certificates: 0 },
    { month: 'Jan 2026', keys: 0, certificates: 0 },
    { month: 'Feb 2026', keys: 0, certificates: 0 },
  ],
  isUsingMockData: true,
}

export const mockHSMSummary = {
  data: [
    { hsm: 'Klavis-IIV', certificates: 12, keys: 4 },
    { hsm: 'Klavis-SPBE', certificates: 12, keys: 4 },
    { hsm: 'Thales-Luna', certificates: 3, keys: 3 },
    { hsm: 'Unknown', certificates: 0, keys: 1 },
  ],
  total_certificates: 27,
  total_keys: 12,
  total_msk: 0,
  total_secret: 12,
  total_hsm: 4,
  status: 'success',
  isUsingMockData: true,
}

export const mockCertAvailKeySecret = {
  certificate_availability: {
    crt_avail: 0,
    csr_avail: 0,
    key_avail: 0,
    total_cert: 27,
  },
  key_secret: {
    key_with_secret: 12,
    key_without_secret: 0,
  },
  isUsingMockData: true,
}

export const mockCertUsageGraph = {
  data: [
    {
      nama_instansi: 'Bank Indonesia',
      total_applications: 2,
      applications: ['Core Banking System'],
    },
    {
      nama_instansi: 'Kementerian Komunikasi dan Informatika',
      total_applications: 2,
      applications: ['E-Government Portal', 'PANDI System'],
    },
    {
      nama_instansi: 'Direktorat Jenderal Pajak',
      total_applications: 2,
      applications: ['E-Filing System', 'Tax Reporting Portal'],
    },
    {
      nama_instansi: 'PT Telkom Indonesia',
      total_applications: 2,
      applications: ['MyTelkomsel App', 'USSD Gateway'],
    },
    {
      nama_instansi: 'PT Bank Mandiri',
      total_applications: 2,
      applications: ['Livin by Mandiri', 'M-Wallet'],
    },
    {
      nama_instansi: 'Kementerian Riset dan Teknologi',
      total_applications: 2,
      applications: ['Research Portal', 'Data Analytics'],
    },
    {
      nama_instansi: 'Kementerian Kelautan dan Perikanan',
      total_applications: 3,
      applications: ['Maritime Database', 'Fisheries System', 'Port Authority'],
    },
    {
      nama_instansi: 'Kementerian Agama',
      total_applications: 2,
      applications: ['Hajj Management System', 'Islamic Education Platform'],
    },
    {
      nama_instansi: 'Kementerian Pendidikan',
      total_applications: 2,
      applications: ['Learning Management System', 'Student Records'],
    },
    {
      nama_instansi: 'BSSN',
      total_applications: 1,
      applications: ['Aplikasi Sanapati'],
    },
  ],
  limit: 10,
  status: 'success',
  sum_cert_integrated: 13,
  sum_institutions: 13,
  sum_key_integrated: 23,
  isUsingMockData: true,
}
