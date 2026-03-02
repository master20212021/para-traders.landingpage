-- ═══════════════════════════════════════════════════════════
-- P'TRADERS — Course Access Table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- Project: taxokgvwudsjkqgxxntx
-- ═══════════════════════════════════════════════════════════

-- 1. Create the course_access table
CREATE TABLE IF NOT EXISTS course_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  buyer_name TEXT,
  hotmart_transaction TEXT,
  hotmart_product TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  notes TEXT
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_course_access_code ON course_access(access_code);
CREATE INDEX IF NOT EXISTS idx_course_access_email ON course_access(email);

-- 3. Enable Row Level Security
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- No direct SELECT/INSERT/UPDATE/DELETE policies for anon
-- anon users can ONLY use the RPC function below
-- Service role (used by Edge Functions) bypasses RLS

-- 4. RPC function: validate a course access code (called from landing page)
CREATE OR REPLACE FUNCTION validate_course_code(code_input TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM course_access
    WHERE access_code = UPPER(TRIM(code_input))
    AND active = true
  );
$$;

-- Grant execute permission to anon role (needed for unauthenticated calls)
GRANT EXECUTE ON FUNCTION validate_course_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_course_code(TEXT) TO authenticated;

-- 5. Helper function: generate a unique course code (PT-XXXX-XXXX)
CREATE OR REPLACE FUNCTION generate_course_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I,O,0,1 to avoid confusion
  i INT;
BEGIN
  LOOP
    new_code := 'PT-';
    FOR i IN 1..4 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    new_code := new_code || '-';
    FOR i IN 1..4 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Ensure uniqueness
    IF NOT EXISTS(SELECT 1 FROM course_access WHERE access_code = new_code) THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- 6. Insert the legacy code so existing users keep access
INSERT INTO course_access (email, access_code, buyer_name, active, notes)
VALUES (
  'legacy@paratrades.com',
  'XK7-PT26-9F3M',
  'Legacy Code',
  true,
  'Original shared access code — kept for backward compatibility'
)
ON CONFLICT (access_code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- ADMIN HELPERS (run manually when needed)
-- ═══════════════════════════════════════════════════════════

-- Generate a new code for a buyer:
-- INSERT INTO course_access (email, access_code, buyer_name, notes)
-- VALUES ('buyer@email.com', generate_course_code(), 'Buyer Name', 'Manual entry');

-- Revoke access (e.g., on refund):
-- UPDATE course_access SET active = false, revoked_at = now()
-- WHERE email = 'buyer@email.com';

-- View all active codes:
-- SELECT email, access_code, buyer_name, created_at FROM course_access WHERE active = true ORDER BY created_at DESC;
