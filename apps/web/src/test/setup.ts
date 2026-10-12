import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// The '@testing-library/jest-dom/vitest' entry cannot be used here: jest-dom is hoisted to the root
// node_modules while vitest is installed under apps/web, so that entry cannot resolve 'vitest' at run
// time or for types. Vitest 5 also takes custom matchers through Matchers<R, T>.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<unknown, R> {}
}
