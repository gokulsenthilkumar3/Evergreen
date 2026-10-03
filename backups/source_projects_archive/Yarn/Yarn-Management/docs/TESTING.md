# Testing Guide

This document provides information about the testing infrastructure and how to run tests.

## Overview

The project uses different testing frameworks for backend and frontend:

- **Backend (API)**: Jest + Supertest
- **Frontend (Web)**: Vitest + React Testing Library
- **End-to-End (E2E)**: Playwright (with Cross-browser support)

## Running Tests

### Backend Tests

```bash
cd apps/api

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd apps/web

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End (E2E) Tests

The system uses Playwright for comprehensive E2E testing across multi-browser and mobile viewports.

```bash
cd apps/web

# Run all E2E tests (Chromium, Firefox, Webkit, Mobile)
npm run test:e2e

# Run tests for a specific module
npx playwright test e2e/auth.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Debugging tests (with Trace Viewer)
npx playwright test --trace on
```

#### Authentication Setup
E2E tests use a **setup project** to authenticate once and reuse the state across all specs. This is handled in `e2e/auth.setup.ts`. 

If you change admin credentials, you must update the system's seed data or the setup script to maintain stability.

## Test Structure

### Backend Tests

- **Unit Tests**: Located in `src/**/__tests__/*.test.ts`
- **Integration Tests**: Located in `src/__tests__/*.test.ts`

Example:
```typescript
describe('Cache Utility', () => {
  it('should store and retrieve values', () => {
    apiCache.set('key', 'value');
    expect(apiCache.get('key')).toBe('value');
  });
});
```

### Frontend Tests

- **Component Tests**: Located in `src/**/__tests__/*.test.tsx`

Example:
```typescript
describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
```

## Code Coverage

Coverage reports are generated in the `coverage/` directory.

**Target Coverage**: 80%+

Current coverage can be viewed by running:
```bash
npm run test:coverage
```

## Writing Tests

### Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Mock External Dependencies**: Use mocks for database, APIs, and third-party services
5. **Keep Tests Independent**: Each test should be able to run in isolation

### Example Test Template

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Commits to main branch
- Before deployment

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**
   - Check Node.js version matches CI
   - Clear node_modules and reinstall

2. **Timeout errors**
   - Increase test timeout in jest.config.js or vitest.config.ts
   - Check for async operations without proper awaits

3. **Module not found errors**
   - Verify import paths are correct
   - Check tsconfig.json paths configuration

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
