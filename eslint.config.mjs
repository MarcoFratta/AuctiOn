import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
            // turns a rule on with no configuration (i.e. uses the default configuration)
            '@typescript-eslint/no-unused-vars': 'off',
            // turns on a rule with configuration
            '@typescript-eslint/no-explicit-any': [
                'warn',
                { ignoreRestArgs: true },
            ],
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
        },
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
)
