import { Column, Entity } from 'typeorm';
import { SysBaseEntity } from './abstract/sys-base-entity';

@Entity('ninja')
export class NinjaEntity extends SysBaseEntity {
  @Column({ type: 'varchar', comment: '游戏 ID' })
  uid: string;

  @Column({ type: 'varchar', comment: '游戏昵称' })
  name: string;
}
