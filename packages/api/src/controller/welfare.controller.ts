import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { MemberService } from '../service/member.service';
import { HttpResp } from '../utils/response';
import { WelfareService } from '../service/welfare/welfare.service';
import * as dayjs from 'dayjs';

@Controller('/welfare')
export class WelfareController {
  @Inject()
  ctx: Context;

  @Inject()
  welfareService: WelfareService;

  @Post('/getWelfareInfo')
  async getWelfareInfo(@Body() params: any) {
    const { satDate: satDateStr } = params;
    const satDate = dayjs(satDateStr).toDate();
    console.log(satDateStr);
    const data = await this.welfareService.getWelfareInfo(satDate);
    return HttpResp.success(data);
  }
}
