#!/usr/bin/env node
import cli from 'commander'
import gitChangedFiles from 'git-changed-files'
import { runAll } from '../src/runners.js'
import { match, readPkg } from '../src/util/index.js'

const DEFAULT_PATTERN = '**/*.spec.js'
const DEFAULT_IGNORE = '**/node_modules/**'
const DEFAULT_ROOT = process.cwd()
const DEFAULT_THREADS = 10
const DEFAULT_GIT_CHANGES_ONLY = false

;(async () => {
  const pkg = await readPkg()

  cli.version(pkg.version)
    .arguments('[pattern]')
    .option('-i, --ignore [value]', 'Ignore files pattern')
    .option('-r, --root [value]', 'The root path')
    .option('-t, --threads [number]', 'Number of threads to run tests concurrently', parseInt)
    .option('-g, --git-changes-only', 'Only process files changes since last git commit')
    .parse(process.argv)

  const pattern = cli.args[0] ? cli.args[0] : DEFAULT_PATTERN
  const ignore = cli.ignore ? cli.ignore : DEFAULT_IGNORE
  const root = cli.root ? cli.root : DEFAULT_ROOT
  const threads = cli.threads ? cli.threads : DEFAULT_THREADS
  const gitChangesOnly = cli.gitChangesOnly ? cli.gitChangesOnly : DEFAULT_GIT_CHANGES_ONLY

  let tests = await match(pattern, ignore, root)
  if (gitChangesOnly) {
    const { committedFiles, unCommittedFiles } = await gitChangedFiles({ diffFilter: 'M' })
    const changedFiles = [...committedFiles, ...unCommittedFiles]
    tests = tests.filter(file => {
      return changedFiles.indexOf(file.replace(/\.test(\.m?js)/, '$1')) !== -1 || changedFiles.indexOf(file) !== -1
    })
  }

  await runAll(tests, threads, root)
})().catch(e => {
  console.error(e)
})
