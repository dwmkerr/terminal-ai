import type { Config } from "jest";

/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const config: Config = {
  //  We're using ts-jest for typescript support. Treat *.ts files as ESM
  //  modules so that we can use 'import'.
  //  See:
  //    https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/
  preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  //  Only look for tests in the src folder, i.e. excluded build.
  roots: ["./src/"],

  //  Jest setup function.
  setupFilesAfterEnv: ["./src/jest.setup.ts"],

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "artifacts/coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  //  The types of coverage reporters to use.
  coverageReporters: ["text", "cobertura"],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: ["./src/setup-jest.js"],

  // The test environment that will be used for testing
  testEnvironment: "node",
};

export default config;
