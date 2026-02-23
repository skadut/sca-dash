import type { CertificateUsageData } from './types'

export const mockACLData: CertificateUsageData = {
  data: [
    {
      app_id_label: 'BSSNCS03',
      hsm: 'Klavis-SPBE',
      used_by: [
        {
          nama_instansi: 'BSSN',
          nama_aplikasi: 'Aplikasi Sanapati',
          key_id: 'aes-256',
        },
      ],
    },
    {
      app_id_label: 'KEMENKESCS03',
      hsm: 'Klavis-SPBE',
      used_by: [
        {
          nama_instansi: 'Kementerian Kesehatan',
          nama_aplikasi: 'sisrsOnline',
          key_id: 'aes-256',
        },
        {
          nama_instansi: 'Kementerian Kesehatan',
          nama_aplikasi: 'SisRS Online',
          key_id: 'rsa3072',
        },
      ],
    },
    {
      app_id_label: 'KEMENPORACS01',
      hsm: 'Klavis-IIV',
      used_by: [
        {
          nama_instansi: 'Kementerian Pemuda dan Olahraga RI',
          nama_aplikasi: 'PON XXI Sumut 2024',
          key_id: 'rsa3072',
        },
      ],
    },
    {
      app_id_label: 'KEMKOMINFOCS01',
      hsm: 'Thales-Luna',
      used_by: [
        {
          nama_instansi: 'Kementerian Komunikasi dan Informatika',
          nama_aplikasi: 'E-Government Portal',
          key_id: 'aes-256',
        },
        {
          nama_instansi: 'Kementerian Komunikasi dan Informatika',
          nama_aplikasi: 'PANDI System',
          key_id: 'rsa3072',
        },
      ],
    },
    {
      app_id_label: 'BIACS01',
      hsm: 'Klavis-SPBE',
      used_by: [
        {
          nama_instansi: 'Bank Indonesia',
          nama_aplikasi: 'Core Banking System',
          key_id: 'aes-256',
        },
      ],
    },
    {
      app_id_label: 'DJPCS01',
      hsm: 'Thales-Luna',
      used_by: [
        {
          nama_instansi: 'Direktorat Jenderal Pajak',
          nama_aplikasi: 'E-Filing System',
          key_id: 'rsa3072',
        },
        {
          nama_instansi: 'Direktorat Jenderal Pajak',
          nama_aplikasi: 'Tax Reporting Portal',
          key_id: 'aes-256',
        },
      ],
    },
    {
      app_id_label: 'TELKOMCS01',
      hsm: 'Klavis-IIV',
      used_by: [
        {
          nama_instansi: 'PT Telkom Indonesia',
          nama_aplikasi: 'MyTelkomsel App',
          key_id: 'aes-256',
        },
        {
          nama_instansi: 'PT Telkom Indonesia',
          nama_aplikasi: 'USSD Gateway',
          key_id: 'rsa3072',
        },
      ],
    },
    {
      app_id_label: 'MANDIRACS01',
      hsm: 'Klavis-SPBE',
      used_by: [
        {
          nama_instansi: 'PT Bank Mandiri',
          nama_aplikasi: 'Livin by Mandiri',
          key_id: 'aes-256',
        },
        {
          nama_instansi: 'PT Bank Mandiri',
          nama_aplikasi: 'M-Wallet',
          key_id: 'aes-256',
        },
      ],
    },
    {
      app_id_label: 'BSNCS01',
      hsm: 'Thales-Luna',
      used_by: [
        {
          nama_instansi: 'Badan Siber dan Sandi Negara',
          nama_aplikasi: 'National Crypto System',
          key_id: 'rsa3072',
        },
      ],
    },
    {
      app_id_label: 'KEMENRUCS01',
      hsm: 'Klavis-SPBE',
      used_by: [
        {
          nama_instansi: 'Kementerian Riset dan Teknologi',
          nama_aplikasi: 'Research Portal',
          key_id: 'aes-2048',
        },
      ],
    },
    {
      app_id_label: 'KEMENKUCS01',
      hsm: 'Klavis-IIV',
      used_by: [
        {
          nama_instansi: 'Kementerian Kelautan dan Perikanan',
          nama_aplikasi: 'Maritime Database',
          key_id: 'rsa-2048',
        },
        {
          nama_instansi: 'Kementerian Kelautan dan Perikanan',
          nama_aplikasi: 'Fisheries System',
          key_id: 'aes-2048',
        },
      ],
    },
  ],
}
