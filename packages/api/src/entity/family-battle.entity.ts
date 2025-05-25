import { Column, Entity, Index } from 'typeorm';
import { SysBaseEntity } from './abstract/sys-base-entity';

@Entity('family_battle')
export class FamilyBattleEntity extends SysBaseEntity {
  @Column({ type: 'varchar', comment: '敌方家族名称' })
  enemyName: string;

  @Index({ unique: true })
  @Column({ type: 'datetime', comment: '族战日期' })
  date: Date;

  @Column({ type: 'varchar', comment: '族战结果' })
  result: string;

  @Column({ type: 'int', comment: '获得总分' })
  score: number;

  @Column({ type: 'varchar', comment: '团本1类型' })
  raidType1: string;

  @Column({ type: 'varchar', comment: '团本2类型' })
  raidType2: string;
}
