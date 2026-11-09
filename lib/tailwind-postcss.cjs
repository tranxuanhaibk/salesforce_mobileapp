/* eslint-disable @typescript-eslint/no-require-imports */
const { compile, optimize } = require('@tailwindcss/node')
const { Scanner } = require('@tailwindcss/oxide')
const postcss = require('postcss')
const path = require('path')

function tailwindV4PostcssPlugin() {
  return {
    postcssPlugin: 'tailwindcss-v4-local',
    async Once(root, { result }) {
      const from =
        (result && result.opts && result.opts.from) ||
        path.resolve(process.cwd(), 'app/globals.css')
      const cssInput = root.toString()
      if (
        !/@(import|reference|theme|variant|config|plugin|apply|tailwind)\b/.test(
          cssInput
        )
      ) {
        return
      }

      const baseDir = path.dirname(path.resolve(from))
      const compiler = await compile(cssInput, {
        from,
        base: baseDir,
        shouldRewriteUrls: true,
        onDependency: () => {},
      })

      // Explicitly scan only source directories (app, components) and exclude .next / node_modules
      // so the scanner never touches ephemeral files like .next/lock on Vercel builds.
      const sources = [
        {
          base: path.resolve(process.cwd(), 'app'),
          pattern: '**/*.{tsx,ts,jsx,js,mdx}',
          negated: false,
        },
        {
          base: path.resolve(process.cwd(), 'components'),
          pattern: '**/*.{tsx,ts,jsx,js,mdx}',
          negated: false,
        },
        {
          base: process.cwd(),
          pattern: '.next/**/*',
          negated: true,
        },
        {
          base: process.cwd(),
          pattern: 'node_modules/**/*',
          negated: true,
        },
      ].concat(compiler.sources)

      const scanner = new Scanner({ sources })
      const candidates = [...scanner.scan()]
      let built = compiler.build(candidates)
      if (process.env.NODE_ENV === 'production') {
        built = optimize(built, { minify: true }).code
      }

      result.root = postcss.parse(built, { from })
    },
  }
}

tailwindV4PostcssPlugin.postcss = true
module.exports = tailwindV4PostcssPlugin
