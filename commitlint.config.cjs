module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'user-service',
      'auth-service',
      'api-gateway',
      'lobby-service',
      'e2e-tests',
      'auction-service',
      'frontend',
      'docs',
      'common']],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'chore',
        'style',
        'refactor',
        'ci',
        'test',
        'revert',
        'perf',
      ],
    ],
  },
};
