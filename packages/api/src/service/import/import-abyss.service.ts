import * as dayjs from 'dayjs';
import { Inject, Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { ImportService } from './import.service';
import { FamilyAbyssScoreEntity } from '../../entity/family-abyss-score.entity';

@Provide()
export class ImportAbyssService {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  importService: ImportService;

  async deelImport(filePath: string) {
    const { list, date } = await this.parseExcel(filePath);
    const oldData = await this.ds.manager.findBy(FamilyAbyssScoreEntity, { date });
    const data = list.map(newItem => {
      const oldItem = oldData.find(item => item.uid === newItem.uid);
      if (oldItem) Object.assign(oldItem, newItem);
      return oldItem ?? this.ds.manager.create(FamilyAbyssScoreEntity, newItem);
    });
    await this.ds.manager.save(data);
  }

  async parseExcel(filePath: string) {
    const { ws, rows } = await this.importService.readFile(filePath);

    // 创建或更新族战对象
    const title = ws.getCell('A1');
    const { date } = this.parseTitle(String(title.value));

    const startLine = 4;
    const dataRows = rows.slice(startLine - 1, ws.rowCount - startLine + 1) ?? [];

    const list = dataRows.map(row => {
      const rank = Number(row.getCell('A'));
      const ninjaInfoStr = String(row.getCell('B'));
      const score = Number(row.getCell('C'));
      const fightCount = Number(row.getCell('D'));
      const uid = ninjaInfoStr.split('（')[1].replace('）', '');
      return { uid, date, score, fightCount, rank };
    });
    return { list, date };
  }

  parseTitle(title: string) {
    const info = title.split(' ');
    const [, , dateStr] = info;
    const date = dayjs(dateStr).toDate();
    return { date };
  }
}
