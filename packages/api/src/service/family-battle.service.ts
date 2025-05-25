import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { Provide } from '@midwayjs/core';
import { FamilyBattleEntity } from '../entity/family-battle.entity';

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
}
