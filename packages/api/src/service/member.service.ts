import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { Provide } from '@midwayjs/core';
import { NinjaEntity } from '../entity/ninja.entity';

@Provide()
export class MemberService {
  @InjectDataSource()
  ds: DataSource;

  async getPage(params: { page: number; size: number }) {
    const { page, size } = params;

    const finder = this.ds.createQueryBuilder(NinjaEntity, 'ninja').where('1=1');

    finder.andWhere('ninja.inFamily');

    if (page && size) finder.skip(size * (page - 1)).take(size);

    finder.orderBy('ninja.joinTime', 'ASC');

    const [rawData, total] = await finder.getManyAndCount();

    return { list: rawData, pagination: { page, size, total } };
  }
}
