import { MidwayConfig } from '@midwayjs/core';

export default {
  // ...
  typeorm: {
    dataSource: {
      default: {
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'ninja_manager_system',
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        logging: false,
        // 支持如下的扫描形式，为了兼容我们可以同时进行.js和.ts匹配
        entities: [
          // 'entity', // 特定目录
          '**/*.entity.{j,t}s', // 通配加后缀匹配
        ],
      },
    },
  },
} as MidwayConfig;
