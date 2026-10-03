UPDATE "SystemSettings"
SET "companyName" = '', "address" = '', "gstin" = '', "phone" = '', "email" = ''
WHERE "companyName" = 'Ever Green Yarn Mills'
  AND "address" = 'Industrial Area, Coimbatore'
  AND "gstin" = '33XXXXX1234X1Z5'
  AND "phone" = '+91 98765 43210'
  AND "email" = 'info@evergreenyarn.com';
