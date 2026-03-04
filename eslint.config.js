import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: { vue: vuePlugin },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      ...vuePlugin.configs['flat/recommended'].rules,
    },
  },
  {
    ignores: ['**/dist/', '**/.turbo/', '**/node_modules/'],
  }
)
