import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { MemberService } from '../service/member.service';
import { HttpResp } from '../utils/response';

@Controller('/member')
export class HomeController {
  @Inject()
  ctx: Context;

  @Inject()
  memberService: MemberService;

  @Post('/getMemberPage')
  async getPage(@Body() params: any) {
    const { page, size } = params;
    const data = await this.memberService.getPage({ page, size });
    return HttpResp.success(data);
  }
}
