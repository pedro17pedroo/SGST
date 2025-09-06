/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  // Mock de módulos CSS e assets
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '<rootDir>/src/config/api': '<rootDir>/src/test/__mocks__/config/api.ts',
    '^../../config/api$': '<rootDir>/src/test/__mocks__/config/api.ts',
    '^../../../config/api$': '<rootDir>/src/test/__mocks__/config/api.ts',
    '^../../services/api.service$': '<rootDir>/src/test/__mocks__/services/api.service.ts',
    '^../use-toast$': '<rootDir>/src/test/__mocks__/hooks/use-toast.ts',
    '^../../use-toast$': '<rootDir>/src/test/__mocks__/hooks/use-toast.ts',
  },
  // Configuração para ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};