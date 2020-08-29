import babel from '@rollup/plugin-babel';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json'

const deps = Object.keys(pkg.dependencies || {})
const peerDeps = Object.keys(pkg.peerDependencies || {})

const makeExternalPredicate = externalArr => {
  if (!externalArr.length) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return id => pattern.test(id)
}

const createConfig = ({ input, output, external }) => {
  let _external = makeExternalPredicate(external === 'peers' ? peerDeps : deps.concat(peerDeps));
  let useESModules = output.format === 'esm';

  return {
    input,
    output: {
      exports: 'named',
      ...output,
    },
    external: _external,
    plugins: [
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        plugins: [
          ["@babel/plugin-transform-runtime", { useESModules }]
        ]
      }),
      filesize()
    ],
    onwarn(warning, warn) {
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
        return
      }
      warn(warning)
    }
  }
}

const multiInput = {
  core: 'src/util.js',
  crypto: 'src/middleware/crypto.js',
}

export default [
  createConfig({
    input: multiInput,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: 'ciri-fetch-[name].js',
    }
  })
]