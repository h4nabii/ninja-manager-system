import { Inject, Controller, Post, Files, Fields } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UploadService } from '../service/upload.service';
import { HttpResp } from '../utils/response';

@Controller('/file')
export class UploadController {
  @Inject()
  ctx: Context;

  @Inject()
  uploadService: UploadService;

  @Post('/upload', { summary: '文件上传' })
  async upload(@Files() files: TempFile[], @Fields() fields: any) {
    console.log(files, '???', fields);
    const [info] = await this.uploadService.saveTempFiles(files);
    return HttpResp.success(info);
  }
}
