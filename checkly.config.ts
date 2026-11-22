import { defineConfig } from 'checkly'

/**
 * See https://www.checklyhq.com/docs/cli/project-structure/
 */
const config = defineConfig({
  /* A human friendly name for your project */
  projectName: 'Raccoon Synthetics',
  /** A logical ID that needs to be unique across your Checkly account */
  logicalId: 'raccoon-synthetics',
  /* An optional URL to your Git repo */
  repoUrl: 'https://github.com/olorunpojuessangd/checkly-synthetics',
  /* Sets default values for Checks */
  checks: {
    /* A default for how often your Check should run in minutes */
    frequency: 10,
    /* Checkly data centers to run your Checks as monitors */
    locations: ['us-east-1', 'eu-central-1'],
    /** The Checkly Runtime identifier, determining npm packages and the Node.js version available at runtime */
    runtimeId: '2025.04',
    /* Files ending in .check.ts under __checks__ hold Checkly settings (groups, API checks) */
    checkMatch: '**/__checks__/**/*.check.ts',
    /* Global configuration for Browser checks */
    playwrightConfig: {
      timeout: 30000,
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
    browserChecks: {
      /* Temporary for Part 2: every .spec.ts file under __checks__ becomes a Browser check.
       * Part 4 changes this so the Playwright group owns these files instead. */
      testMatch: '**/__checks__/**/*.spec.ts',
    },
  },
  cli: {
    /* The default datacenter location to use when running npx checkly test */
    runLocation: 'eu-central-1',
    /* How many times to retry a failing test run when running `npx checkly test` (max. 3) */
    retries: 0,
  },
})

export default config