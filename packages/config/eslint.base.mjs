export default [{
  ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  rules: {
    'no-debugger': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
  },
}];
