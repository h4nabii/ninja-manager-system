import * as path from 'node:path';
import * as fs from 'node:fs';
import { Inject, makeHttpRequest, Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, In } from 'typeorm';
import { UploadService } from '../upload.service';
import { MemberService } from '../member.service';
import { ImportMemberService } from './import-member.service';
import { ImportBattleService } from './import-battle.service';
import { ImportAbyssService } from './import-abyss.service';
import { FamilyBattleEntity } from '../../entity/family-battle.entity';
import * as exceljs from 'exceljs';

@Provide()
export class ImportService {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  uploadService: UploadService;

  @Inject()
  ninjaMemberService: MemberService;

  @Inject()
  importMemberService: ImportMemberService;

  @Inject()
  importBattleService: ImportBattleService;

  @Inject()
  importAbyssService: ImportAbyssService;

  async importByUrl(url: string) {
    const info = await this.downloadFromUrl(url);
    const { type, filePath } = info;
    if (type === 'member') {
      await this.importMemberService.deelImport(filePath);
    } else if (type === 'battle-report') {
      await this.importBattleService.deelImport(filePath);
    } else if (type === 'abyss-report') {
      await this.importAbyssService.deelImport(filePath);
    } else {
      throw new Error('不支持的类型，请检查 URL 或联系管理');
    }
    return info.type;
  }

  async downloadFromUrl(url: string) {
    console.log(url, 'url');
    const resp = await makeHttpRequest(url);
    if (!(resp.data instanceof Buffer)) throw new Error('response type is not buffer');
    const urlInfo = new URL(url).pathname.split('/');
    const [, , , type, hash, name] = urlInfo;
    const basename = path.basename(decodeURI(name));
    const extname = path.extname(decodeURI(name));
    const fileName = `${basename}-${hash}${extname}`;
    const saveDir = await this.uploadService.getSaveDir();
    const filePath = `${saveDir}/${fileName}`;
    fs.writeFileSync(filePath, new DataView(resp.data.buffer));
    return { name, type, filePath };
  }

  async checkBattleImportStates(dates: Date[]) {
    const battles = await this.ds.manager.find(FamilyBattleEntity, { where: { date: In(dates) } });
    console.log(battles);
    return dates.map(d => {
      if (battles.find(i => i.date.getTime() === d.getTime())) {
        return { date: d, state: 'imported', text: '已导入' };
      } else {
        return { date: d, state: 'no-data', text: '无数据' };
      }
    });
  }

  async readFile(filePath: string) {
    if (!fs.existsSync(filePath)) throw new Error('文件不存在，请检查路径');
    const wb = new exceljs.Workbook();
    await wb.xlsx.readFile(filePath);
    const ws = wb.getWorksheet(1);
    if (!ws) throw new Error('未找到工作表，请检查文件格式');
    const rows = ws.getRows(1, ws.rowCount);
    if (!rows) throw new Error('未找到数据行，请检查文件格式');
    return { wb, ws, rows };
  }
}
