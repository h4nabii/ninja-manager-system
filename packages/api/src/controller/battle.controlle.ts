import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { HttpResp } from '../utils/response';
import { FamilyBattleService } from '../service/family-battle.service';

@Controller('/battle')
export class HomeController {
  @Inject()
  ctx: Context;

  @Inject()
  familyBattleService: FamilyBattleService;

  @Post('/getFightInfo')
  async getPage(@Body() params: any) {
    const { type, page, size, time } = params;
    const timeDate = time ? new Date(time) : new Date();
    if (String(type).startsWith('raid')) {
      // 团本数据
      const order = Number(String(params.type).replace('raid', ''));
      const data = await this.familyBattleService.getRaidPage({ time: timeDate, order, page, size });
      return HttpResp.success(data);
    } else if (String(type).startsWith('fight')) {
      // 3v3数据
      // const data = await this.familyBattleService.getPage({ page, size });
      return HttpResp.success({ list: [], pagination: { total: 0, page: 1, size: 10 } });
    } else {
      // 异常处理
      return HttpResp.error('不支持的类型，请检查 URL 或联系管理');
    }
  }

  @Post('/getBattleInfo')
  async getBattleInfo(@Body() params: any) {
    const { date } = params;
    if (!date) return HttpResp.error('请提供日期');
    const dateObj = new Date(date);
    try {
      const battleInfo = await this.familyBattleService.getBattleInfo(dateObj);
      return HttpResp.success(battleInfo);
    } catch (err: any) {
      return HttpResp.error(err.message);
    }
  }
}
