module.exports = {
<<<<<<< HEAD
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            ['user-service', 'auth-service', 'api-gateway', 'lobby-service'],
        ],
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
                'vercel',
            ],
        ],
    },
}
=======
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['user-service', 'auth-service', 'api-gateway', 'lobby-service']],
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
        'vercel',
      ],
    ],
  },
};
>>>>>>> c774751 (chore: fix project structure bug)
