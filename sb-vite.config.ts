import {defineConfig, loadEnv} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = {...process.env, ...env};

  return {
    // No Remix Vite plugin here
    plugins: [tsconfigPaths()],
    resolve: {
      alias: {
        '@/': path.join(__dirname, 'src/'),
      },
    },
  };
});
