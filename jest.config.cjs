/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'server',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/server', '<rootDir>/shared'],
      testMatch: [
        '<rootDir>/server/**/__tests__/**/*.+(ts|js)',
        '<rootDir>/server/**/*.(test|spec).+(ts|js)',
        '<rootDir>/shared/**/__tests__/**/*.+(ts|js)',
        '<rootDir>/shared/**/*.(test|spec).+(ts|js)'
      ],
      transform: {
        '^.+\.ts$': ['ts-jest', {
          tsconfig: {
            types: ['jest', '@types/jest', 'node']
          }
        }]
      },
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1'
      },
      setupFiles: ['dotenv/config']
    },
    {
      displayName: 'client',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/client'],
      testMatch: [
        '<rootDir>/client/**/__tests__/**/*.+(ts|tsx|js)',
        '<rootDir>/client/**/*.(test|spec).+(ts|tsx|js)'
      ],
      transform: {
        '^.+\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            types: ['jest', '@types/jest', '@testing-library/jest-dom']
          }
        }]
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@/(.*)$': '<rootDir>/client/src/$1'
      }
    }
  ],
  collectCoverageFrom: [
    'server/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  coverageReporters: ['text', 'lcov', 'html']
};