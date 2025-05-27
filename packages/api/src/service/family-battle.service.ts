import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { Provide } from '@midwayjs/core';
import { FamilyBattleEntity } from '../entity/family-battle.entity';
import * as dayjs from 'dayjs';
import { FamilyRaidEntity } from '../entity/family-raid.entity';
import { NinjaEntity } from '../entity/ninja.entity';

@Provide()
export class FamilyBattleService {
  @InjectDataSource()
  ds: DataSource;

  async upsertBattleRecord(battleInfo: { enemyName: string; date: Date; result: string; score: number }) {
    const oldBattle = await this.ds.manager.findOneBy(FamilyBattleEntity, { date: battleInfo.date });
    if (oldBattle) {
      oldBattle.enemyName = battleInfo.enemyName;
      oldBattle.result = battleInfo.result;
      oldBattle.score = battleInfo.score;
      return await this.ds.manager.save(oldBattle);
    } else {
      const newBattle = this.ds.manager.create(FamilyBattleEntity, battleInfo);
      return await this.ds.manager.save(newBattle);
    }
  }

  async getBattleInfo(date: Date) {
    const normTime = dayjs(date).startOf('day').toDate();
    const battle = await this.ds.manager.findOneBy(FamilyBattleEntity, { date: normTime });
    if (!battle) throw new Error('未找到对应的族战记录');
    return battle;
  }

  async getRaidPage(params: { time: Date; order: number; page: number; size: number }) {
    const { time, page, size } = params;
    const normTime = dayjs(time).startOf('day').toDate();

    const battle = await this.ds.manager.findOneBy(FamilyBattleEntity, { date: normTime });
    if (!battle) throw new Error('未找到对应的族战记录');
    const raidType = battle[`raidType${params.order as 1 | 2}`];

    const raidFinder = this.ds
      .createQueryBuilder<FamilyRaidEntity & { ninja?: NinjaEntity }>(FamilyRaidEntity, 'raid')
      .leftJoinAndMapOne('raid.ninja', NinjaEntity, 'ninja', 'ninja.uid = raid.uid')
      .where('1=1');
    raidFinder.andWhere("raid.battleType = 'battle'");
    raidFinder.andWhere('raid.battleId = :battleId', { battleId: battle.id });
    raidFinder.andWhere('raid.type = :raidType', { raidType });

    // if (page && size) raidFinder.skip((page - 1) * size);
    // if (size) raidFinder.take(size);
    raidFinder.orderBy('raid.score', 'DESC');

    const rawData = await raidFinder.getMany();
    const total = rawData.length;

    let list = rawData.map((item, index) => {
      return { ...item, name: item.ninja?.name ?? '', rank: index + 1 };
    });
    if (page && size) list = list.slice((page - 1) * size, page * size);

    return { list, pagination: { page, size, total } };
  }
}
