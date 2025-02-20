#!/usr/bin/env node

import type { Config } from '../types'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { program } from 'commander'
import { loadConfig } from 'unconfig'
import chalk from 'chalk'

import MockServer from '../index'
import { createLogger } from '../logger'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'))

program
  .version(packageJson.version)
  .option('-p, --port <port>', 'Set server port')
  .option('-d, --delay <ms>', 'Set response delay')
  .option('--db-storage <path>', 'Set db storage file path')
  .option('--db-model <path>', 'Set db models file or folder path')
  .parse(process.argv)

const options = program.opts()

const logger = createLogger('CLI')
// Try to load config files with different formats by priority
async function loadConfigFile() {
  try {
    const { config } = await loadConfig({
      sources: [
        {
          files: 'mock.config',
          // default extensions
          extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
          parser: 'auto',
        },
        // load `mock` field in `package.json` if no above config files found
        {
          files: 'package.json',
          extensions: [],
          rewrite(config: any) {
            return config?.mock
          },
        },
      ],
      // if false, the only the first matched will be loaded
      // if true, all matched will be loaded and deep merged
      merge: false,
    })
    return config
  }
  catch (e: any) {
    logger.error(chalk`{red ▶ 配置文件加载失败!}\n{gray 错误详情:} {white ${e.message}}`)
    process.exit(1)
  }
}

const configFromFile = await loadConfigFile()

console.log(configFromFile)

const config: Config = {
  port: Number.parseInt(options.port || configFromFile.port),
  delay: Number.parseInt(options.delay || configFromFile.delay),
  dbStoragePath: options.dbStoragePath || configFromFile.dbStorage,
  dbModelPath: options.dbModelPath || configFromFile.dbModel,
}

const server = new MockServer(config)
server.start()
