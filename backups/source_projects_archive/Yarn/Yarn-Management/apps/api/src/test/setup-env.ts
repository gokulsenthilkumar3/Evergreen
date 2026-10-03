// Unit tests that only exercise routing still import the environment validator.
// These inert values never connect to a database or issue production tokens.
process.env.DATABASE_URL ||= 'postgresql://invalid:invalid@localhost:5432/test';
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-at-least-16-chars';
