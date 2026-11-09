import path from 'path'

const config = {
  plugins: [path.resolve(process.cwd(), 'lib/tailwind-postcss.cjs')],
}

export default config
