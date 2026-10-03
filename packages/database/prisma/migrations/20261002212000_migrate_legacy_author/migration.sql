-- AUTHOR was the legacy administrator role. Preserve those privileges before
-- the application rejects roles outside VIEWER, MODIFIER, and ADMIN.
UPDATE "User"
SET "role" = 'ADMIN'
WHERE UPPER("role") = 'AUTHOR';
