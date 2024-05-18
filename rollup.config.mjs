import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'blake3.ts',
  output: [
    {
      file: 'dist/bundle.umd.js',
      name: 'blake3',
      format: 'umd',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'es'
    }
  ],
  plugins: [typescript(), terser()]
};