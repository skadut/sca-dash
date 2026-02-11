import type { CertificateRelations } from './types'

export const mockACLData: CertificateRelations = {
  relations: {
    'BSSNCS01': ['2000aes256enc001'],
    'BSSNCS02': ['2000aes256enc002'],
    'BSSNCS03': ['2000aes256enc003'],
    'BSSNCS04': ['2000aes256enc004'],
    'BSSNCS05': ['2000aes256enc005'],
    'BSSNCS06': ['2000rsa3072enc006'],
    'BSSNCS07': ['2000aes256enc007'],
    'KEMENKESCS01': ['2001aes256enc001'],
    'KEMENKESCS02': ['2001aes256enc003', '2001rsa3072enc002'],
    'KEMENKESCS03': ['2001aes256enc005', '2001rsa3072enc004'],
  },
  status: 'success',
  total_cert_apps: 10,
}
