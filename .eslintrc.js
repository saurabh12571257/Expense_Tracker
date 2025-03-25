module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'no-unused-vars': ['error', { 
      varsIgnorePattern: '^[A-Z_]',
      argsIgnorePattern: '^_'
    }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  }
}; 