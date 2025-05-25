import { Column, Entity, Index } from 'typeorm';
import { SysBaseEntity } from './abstract/sys-base-entity';

@Entity('ninja')
export class NinjaEntity extends SysBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', comment: '游戏 ID' })
  uid: string;

  @Column({ type: 'varchar', comment: '游戏昵称' })
  name: string;

  @Column({ type: 'datetime', comment: '加入时间' })
  joinTime: Date;

  @Column({ type: 'tinyint', comment: '是否在家族中', default: true })
  inFamily: boolean;
}
