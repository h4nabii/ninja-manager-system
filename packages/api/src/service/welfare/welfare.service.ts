import { Inject, Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, In } from 'typeorm';
import * as dayjs from 'dayjs';
import { FamilyBattleEntity } from '../../entity/family-battle.entity';
import { FamilyAbyssScoreEntity } from '../../entity/family-abyss-score.entity';
import { FamilyFightEntity } from '../../entity/family-fight.entity';

@Provide()
export class WelfareService {
  @InjectDataSource()
  ds: DataSource;

  async getWelfareInfo(satDate: Date) {
    const saturday = dayjs(satDate).startOf('day');
    const abyssDay = saturday.subtract(1, 'day');
    const sunday = saturday.add(1, 'day');

    const battles = await this.ds.manager.findBy(FamilyBattleEntity, {
      date: In([saturday.toDate(), sunday.toDate()]),
    });
    const fights = await this.ds.manager.findBy(FamilyFightEntity, { battleId: In(battles.map(b => b.id)) });
    const fightData = fights.reduce(
      (acc, fight) => {
        const battle = battles.find(b => b.id === fight.battleId);
        if (!battle) return acc;
        const fightDate = dayjs(battle.date);
        const key = fightDate.format('YYYY-MM-DD');
        const item = `${fight.type} ${fight.difficulty} ${fight.result} ${fight.mvp}`;
        if (acc[key]) acc[key].push(item);
        else acc[key] = [item];
        return acc;
      },
      {} as Record<string, any>
    );

    console.log(fightData);
  }
}
