const typescript = require('rollup-plugin-typescript2');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' })
  ],
  external: ['axios', 'spark-md5']
};