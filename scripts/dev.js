import esbuild from 'esbuild'
import minimist from 'minimist'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const args = minimist(process.argv.slice(2))
const target = args._[0] || 'reactivity'
const format = args.f || 'global'
const pkg = require(`../packages/${target}/package.json`)

const outputFormat = format.startsWith('global') 
  ? 'iife' : format === 'cjs'
  ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

esbuild
  .context({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.js`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
  })
  .then(ctx => {
    console.log('watching...');
    ctx.watch()
  })