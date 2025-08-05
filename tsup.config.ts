import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    orm: 'src/orm/index.ts',
    index: 'src/index.ts',
    zod: 'src/zod/index.ts',
    dtos: 'src/dtos/index.ts',
    helpers: 'src/helpers/index.ts',
    'list-view': 'src/list-view/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  tsconfig: './tsconfig.build.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  outDir: 'dist',
  target: 'node16',
  external: [
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/sequelize',
    '@nestjs/swagger',
    'sequelize',
    'sequelize-typescript',
    'zod',
    'axios',
  ],
  onSuccess: 'echo "Build completed successfully!"',
});
