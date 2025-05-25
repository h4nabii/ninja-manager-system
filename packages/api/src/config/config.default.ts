import { MidwayConfig } from '@midwayjs/core';

// noinspection SpellCheckingInspection
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: 'eC-V7-MXA-IcXl0aonpOD',
  // koa
  koa: { port: 11894 },
  // 静态文件部署
  staticFile: { buffer: true },
  // 文件上传
  busboy: {
    mode: 'file',
    whitelist: null,
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1GB
    },
  },
  // busboy: { mode: 'file', whitelist: null },
} as MidwayConfig;
