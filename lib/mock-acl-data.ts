import type { CertificateRelations } from './types'

export const mockACLData: CertificateRelations = {
  relations: {
    'CERT_KEMKOMINFO_001': [
      '2001aes256enc001',
      '2001aes256enc002',
      '2001rsa3072enc001',
    ],
    'CERT_KEMKOMINFO_002': [
      '2001aes256enc003',
      '2001aes256enc004',
    ],
    'CERT_BI_PROD_001': [
      '2002aes256enc001',
      '2002aes256enc002',
      '2002aes256enc003',
      '2002rsa3072enc001',
    ],
    'CERT_BI_PROD_002': [
      '2002aes256enc004',
      '2002rsa3072enc002',
    ],
    'CERT_KEMENTERIAN_KESEHATAN_001': [
      '2003aes256enc001',
      '2003aes256enc002',
      '2003rsa3072enc001',
      '2003rsa3072enc002',
    ],
    'CERT_KEMENTERIAN_KESEHATAN_002': [
      '2003aes256enc003',
    ],
    'CERT_TELKOM_PROD_001': [
      '2004aes256enc001',
      '2004aes256enc002',
      '2004aes256enc003',
      '2004rsa3072enc001',
    ],
    'CERT_TELKOM_PROD_002': [
      '2004aes256enc004',
      '2004aes256enc005',
    ],
    'CERT_TELKOM_UAT_001': [
      '2004aes256enc006',
      '2004rsa3072enc002',
    ],
    'CERT_MANDIRI_PROD_001': [
      '2005aes256enc001',
      '2005aes256enc002',
      '2005aes256enc003',
      '2005rsa3072enc001',
    ],
    'CERT_MANDIRI_PROD_002': [
      '2005aes256enc004',
      '2005rsa3072enc002',
      '2005rsa3072enc003',
    ],
    'CERT_PAJAK_PROD_001': [
      '2006aes256enc001',
      '2006aes256enc002',
      '2006rsa3072enc001',
    ],
    'CERT_PAJAK_AUDIT_001': [
      '2006aes256enc003',
    ],
    'CERT_BSN_CRYPTO_001': [
      '2007aes256enc001',
      '2007rsa3072enc001',
      '2007rsa3072enc002',
      '2007rsa3072enc003',
    ],
    'CERT_KEMENDAGRI_EKTP_001': [
      '2008aes256enc001',
      '2008aes256enc002',
      '2008rsa3072enc001',
    ],
  },
  status: 'success',
  total_cert_apps: 15,
}
