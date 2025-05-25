import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { NinjaEntity } from '../entity/ninja.entity';
import { Provide } from '@midwayjs/core';

@Provide()
export class NinjaMemberService {
  @InjectDataSource()
  ds: DataSource;
}
