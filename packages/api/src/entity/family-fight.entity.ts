import { Column, Entity, Index } from 'typeorm';
import { SysBaseEntity } from './abstract/sys-base-entity';

@Index(['battleId', 'type', 'order'], { unique: true })
@Entity('family_fight')
export class FamilyFightEntity extends SysBaseEntity {
  @Column({ type: 'int', comment: '族战 ID' })
  battleId: number;

  @Column({ type: 'varchar', comment: '类型' })
  type: string;

  @Column({ type: 'int', comment: '场次' })
  order: number;

  @Column({ type: 'float', comment: '战斗分数' })
  score: number;

  @Column({ type: 'varchar', comment: '战斗结果' })
  result: string;

  @Column({ type: 'varchar', comment: '战斗地图' })
  map: string;

  @Column({ type: 'varchar', comment: '地图难度' })
  difficulty: string;

  @Column({ type: 'json', comment: '战场效果' })
  effects: string[];

  @Column({ type: 'json', comment: '忍者信息' })
  ninjaInfo: { uid: string; score: number }[];

  @Column({ type: 'varchar', comment: 'mvp uid' })
  mvp: string;
}
