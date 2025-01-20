-- First, check current role
SELECT email, role, is_active, status 
FROM user_management 
WHERE email = 'p.jaworski@erp-view.pl';

-- Then update to admin if needed
UPDATE user_management 
SET 
  role = 'admin',
  is_active = true,
  status = 'approved'
WHERE email = 'p.jaworski@erp-view.pl';

-- Verify the update
SELECT email, role, is_active, status 
FROM user_management 
WHERE email = 'p.jaworski@erp-view.pl';
