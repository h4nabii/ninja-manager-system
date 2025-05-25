import { Column, Entity, Index } from 'typeorm';
import { SysBaseEntity } from './abstract/sys-base-entity';

@Index(['uid', 'type', 'battleType', 'battleId'], { unique: true })
@Entity('family_raid')
export class FamilyRaidEntity extends SysBaseEntity {
  @Column({ type: 'varchar', comment: '忍者 ID' })
  uid: string;

  @Column({ type: 'varchar', comment: '团本类型' })
  type: string;

  @Column({ type: 'int', comment: '团本分数' })
  score: number;

  @Column({ type: 'varchar', comment: '战斗类别' })
  battleType: string;

  @Column({ type: 'int', comment: '战斗 ID' })
  battleId: number;
}
