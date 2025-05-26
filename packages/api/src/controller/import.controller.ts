import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, IsNull, Not } from 'typeorm';
import { HttpResp } from '../utils/response';
import { ImportService } from '../service/import.service';
import { FamilyRaidEntity } from '../entity/family-raid.entity';
import { FamilyFightEntity } from '../entity/family-fight.entity';
import { FamilyBattleEntity } from '../entity/family-battle.entity';
import * as dayjs from 'dayjs';

@Controller('/import')
export class ImportController {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  importService: ImportService;

  @Post('/byUrl')
  async importByUrl(@Body('url') url: string) {
    try {
      const type = await this.importService.importByUrl(url);
      return HttpResp.success({ type });
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.stack);
        console.error(err.message);
        return HttpResp.error(err.message);
      } else throw Error('Unknown Error');
    }
  }

  @Post('/checkBattleImportStates')
  async checkBattleImportStates(@Body() params: any) {
    const days = params.days || [];
    const dates = days.map((i: string) => dayjs(i).toDate());
    const states = await this.importService.checkBattleImportStates(dates);
    return HttpResp.success(states);
  }
}
