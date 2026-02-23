-- Database schema for certificate usage tracking
-- This script creates tables to store institution, certificate, and application data

CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  id_login VARCHAR(50) UNIQUE NOT NULL,
  nama_instansi VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  app_id_label VARCHAR(100) UNIQUE NOT NULL,
  hsm VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  certificate_id INT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  institution_id INT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  nama_aplikasi VARCHAR(255) NOT NULL,
  key_id VARCHAR(100) NOT NULL,
  total_msk INT DEFAULT 0,
  total_secret INT DEFAULT 0,
  total_keys INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(certificate_id, institution_id, nama_aplikasi)
);

CREATE INDEX IF NOT EXISTS idx_applications_institution ON applications(institution_id);
CREATE INDEX IF NOT EXISTS idx_applications_certificate ON applications(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_app_id ON certificates(app_id_label);
CREATE INDEX IF NOT EXISTS idx_institutions_id_login ON institutions(id_login);
