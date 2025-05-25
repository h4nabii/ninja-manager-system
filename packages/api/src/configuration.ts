import { Configuration, App } from '@midwayjs/core';
import * as orm from '@midwayjs/typeorm';
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import * as validate from '@midwayjs/validate';
import * as busboy from '@midwayjs/busboy';
import * as info from '@midwayjs/info';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { UploadMiddleware } from '@midwayjs/busboy';

@Configuration({
  imports: [
    // modules
    orm,
    koa,
    staticFile,
    validate,
    busboy,
    { component: info, enabledEnvironment: ['local'] },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware, UploadMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
