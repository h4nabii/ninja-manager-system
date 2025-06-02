import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, IsNull, Not } from 'typeorm';
import * as dayjs from 'dayjs';
import { NinjaEntity } from '../../entity/ninja.entity';
import { Inject, Provide } from '@midwayjs/core';
import { ImportService } from './import.service';

@Provide()
export class ImportMemberService {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  importService: ImportService;

  async deelImport(filePath: string) {
    const data = await this.parseExcel(filePath);
    const rawEntities = data.map(i => ({ ...i, inFamily: true }));
    await this.ds.manager.update(NinjaEntity, { id: Not(IsNull()) }, { inFamily: false });
    await this.ds.manager.upsert(NinjaEntity, rawEntities, ['uid']);
  }

  async parseExcel(filePath: string) {
    const { rows } = await this.importService.readFile(filePath);
    // Assuming the first row is the header
    return rows.slice(1).map(i => {
      const uid = String(i.getCell(1).value);
      const name = String(i.getCell(2).value);
      const joinTime = dayjs(String(i.getCell(3).value)).toDate();
      console.log({ uid, name, joinTime });
      return { uid, name, joinTime };
    });
  }
}
