import { SysBaseEntity } from './abstract/sys-base-entity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'ninja_change_record' })
export class NinjaChangeRecordEntity extends SysBaseEntity {
  @Column({ type: 'varchar', comment: '变更类型' })
  type: 'join' | 'quit';

  @Column({ comment: '变更时间' })
  time: Date;
}
