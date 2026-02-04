-- Create the cert_test table for HSM Cryptography certificate access
CREATE TABLE IF NOT EXISTS cert_test (
  id SERIAL PRIMARY KEY,
  app_id_label TEXT NOT NULL,
  created_date VARCHAR(8) NOT NULL, -- YYYYMMDD format
  expired_date VARCHAR(8) NOT NULL  -- YYYYMMDD format
);

-- Insert sample data
INSERT INTO cert_test (app_id_label, created_date, expired_date) VALUES
  ('HSM-PROD-001', '20240115', '20250115'),
  ('HSM-DEV-002', '20230601', '20240601'),
  ('HSM-STAGING-003', '20240301', '20250301'),
  ('HSM-BACKUP-004', '20240710', '20250710'),
  ('HSM-TEST-005', '20231201', '20241201'),
  ('HSM-PROD-006', '20240820', '20250820'),
  ('HSM-API-007', '20240101', '20260101'),
  ('HSM-AUTH-008', '20230915', '20240915'),
  ('HSM-SIGN-009', '20240505', '20250505'),
  ('HSM-ENCRYPT-010', '20240620', '20260620');
