import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["react-native"],
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/src/**/*.spec.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": [ "babel-jest", { presets: ['@babel/preset-env', '@babel/preset-react'] } ],
  },
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    'node_modules/(?!@elilillyco/ux-lds-react)/'
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
}

export default async () => ({
  ...(await createJestConfig(config)()),
  transformIgnorePatterns: [
    'node_modules/(?!@elilillyco/ux-lds-react)/'
  ],
})
