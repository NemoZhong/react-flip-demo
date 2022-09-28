// https://umijs.org/config/
import { defineConfig } from 'umi';
import { resolve } from 'path';
import { vars } from '../src/style/variable';
import { routes } from './routes';

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  base: './',
  publicPath: './',
  // mfsu: {},
  alias: {
    '@': resolve(__dirname, './src'),
  },
  targets: {
    ie: 11,
  },
  mock: {
    exclude: process.env.API_ENV === 'mock' ? [] : ['mock'],
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    ...vars,
  },
  title: 'demo',
  ignoreMomentLocale: true,
});
