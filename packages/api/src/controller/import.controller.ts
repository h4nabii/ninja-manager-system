import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { HttpResp } from '../utils/response';
import { ImportService } from '../service/import.service';

@Controller('/import')
export class ImportController {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  imp: ImportService;

  @Post('/byUrl')
  async importByUrl(@Body('url') url: string) {
    try {
      await this.imp.importByUrl(url);
      return HttpResp.success();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.stack);
        console.error(err.message);
        return HttpResp.error(err.message);
      } else throw Error('Unknown Error');
    }
  }
}
