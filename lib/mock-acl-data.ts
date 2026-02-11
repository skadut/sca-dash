import type { CertificateUsageData } from './types'

export const mockACLData: CertificateUsageData = {
  'KEMENKESCS03': {
    app_id_label: 'KEMENKESCS03',
    hsm: 'Klavis-SPBE',
    used_by: [
      {
        nama_instansi: 'Kementerian Kesehatan',
        nama_aplikasi: 'sisrsOnline',
      },
      {
        nama_instansi: 'Kementerian Kesehatan',
        nama_aplikasi: 'SisRS Online',
      },
    ],
  },
  'KEMENPORACS01': {
    app_id_label: 'KEMENPORACS01',
    hsm: 'Klavis-IIV',
    used_by: [
      {
        nama_instansi: 'Kementerian Pemuda dan Olahraga RI',
        nama_aplikasi: 'PON XXI Sumut 2024',
      },
    ],
  },
  'KEMKOMINFOCS01': {
    app_id_label: 'KEMKOMINFOCS01',
    hsm: 'Thales-Luna',
    used_by: [
      {
        nama_instansi: 'Kementerian Komunikasi dan Informatika',
        nama_aplikasi: 'E-Government Portal',
      },
      {
        nama_instansi: 'Kementerian Komunikasi dan Informatika',
        nama_aplikasi: 'PANDI System',
      },
    ],
  },
  'BIACS01': {
    app_id_label: 'BIACS01',
    hsm: 'Klavis-SPBE',
    used_by: [
      {
        nama_instansi: 'Bank Indonesia',
        nama_aplikasi: 'Core Banking System',
      },
    ],
  },
  'DJPCS01': {
    app_id_label: 'DJPCS01',
    hsm: 'Thales-Luna',
    used_by: [
      {
        nama_instansi: 'Direktorat Jenderal Pajak',
        nama_aplikasi: 'E-Filing System',
      },
      {
        nama_instansi: 'Direktorat Jenderal Pajak',
        nama_aplikasi: 'Tax Reporting Portal',
      },
    ],
  },
  'TELKOMCS01': {
    app_id_label: 'TELKOMCS01',
    hsm: 'Klavis-IIV',
    used_by: [
      {
        nama_instansi: 'PT Telkom Indonesia',
        nama_aplikasi: 'MyTelkomsel App',
      },
      {
        nama_instansi: 'PT Telkom Indonesia',
        nama_aplikasi: 'USSD Gateway',
      },
    ],
  },
  'MANDIRACS01': {
    app_id_label: 'MANDIRACS01',
    hsm: 'Klavis-SPBE',
    used_by: [
      {
        nama_instansi: 'PT Bank Mandiri',
        nama_aplikasi: 'Livin by Mandiri',
      },
      {
        nama_instansi: 'PT Bank Mandiri',
        nama_aplikasi: 'M-Wallet',
      },
    ],
  },
  'BSNCS01': {
    app_id_label: 'BSNCS01',
    hsm: 'Thales-Luna',
    used_by: [
      {
        nama_instansi: 'Badan Siber dan Sandi Negara',
        nama_aplikasi: 'National Crypto System',
      },
    ],
  },
}
