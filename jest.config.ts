import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Points to your Next.js app root (for next.config.mjs and .env files)
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  testPathPattern: ['<rootDir>/src/**/*.test.{ts,tsx}'],
}

export default createJestConfig(config)
