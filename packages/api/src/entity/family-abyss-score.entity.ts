import { Column, Entity } from 'typeorm';
import { SysBaseEntity } from './abstract/sys-base-entity';

@Entity('family_abyss_score')
export class FamilyAbyssScoreEntity extends SysBaseEntity {
  @Column({ comment: '忍者 UID', type: 'varchar' })
  uid: string;

  @Column({ comment: '深渊日期', type: 'varchar' })
  date: Date;

  @Column({ comment: '深渊分数', type: 'int' })
  score: number;

  @Column({ comment: '战斗次数', type: 'int' })
  fightCount: number;

  @Column({ comment: '排名', type: 'int' })
  rank: number;
}
