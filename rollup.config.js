import babel from '@rollup/plugin-babel';

export default {
  input: "lib/index.js",
  output: {
    file: "ciri-fetch.js",
    format: "cjs"
  },
  plugins: [
    babel({ 
      babelHelpers: 'runtime',
      exclude: 'node_modules/**'
    })
  ]
}