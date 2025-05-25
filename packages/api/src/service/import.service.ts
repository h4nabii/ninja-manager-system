import { Inject, makeHttpRequest, Provide } from '@midwayjs/core';
import { UploadService } from './upload.service';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, IsNull, Not } from 'typeorm';
import { NinjaEntity } from '../entity/ninja.entity';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as exceljs from 'exceljs';
import * as dayjs from 'dayjs';
import { NinjaMemberService } from './ninja-member.service';
import { FamilyBattleEntity } from '../entity/family-battle.entity';
import { FamilyRaidEntity } from '../entity/family-raid.entity';
import { FamilyFightEntity } from '../entity/family-fight.entity';

@Provide()
export class ImportService {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  uploadService: UploadService;

  @Inject()
  ninjaMemberService: NinjaMemberService;

  async importByUrl(url: string) {
    const info = await this.downloadFromUrl(url);
    const { type, filePath } = info;
    if (type === 'member') {
      await this.dealMemberImport(filePath);
    } else if (type === 'battle-report') {
      await this.parseBattleReportExcel(filePath);
    } else {
      throw new Error('不支持的类型，请检查 URL 或联系管理');
    }
  }

  async dealMemberImport(filePath: string) {
    const data = await this.parseMemberExcel(filePath);
    const rawEntities = data.map(i => ({ ...i, inFamily: true }));
    await this.ds.manager.update(NinjaEntity, { id: Not(IsNull()) }, { inFamily: false });
    await this.ds.manager.upsert(NinjaEntity, rawEntities, ['uid']);
  }

  async parseMemberExcel(filePath: string) {
    const wb = new exceljs.Workbook();
    await wb.xlsx.readFile(filePath);
    const ws = wb.getWorksheet(1);
    // 排除标题行
    const rows = ws.getRows(2, ws.rowCount - 1);
    return rows.map(i => {
      const uid = String(i.getCell(1).value);
      const name = String(i.getCell(2).value);
      const joinTime = dayjs(String(i.getCell(3).value)).toDate();
      return { uid, name, joinTime };
    });
  }

  async parseBattleReportExcel(filePath: string) {
    const wb = new exceljs.Workbook();
    await wb.xlsx.readFile(filePath);
    const ws = wb.getWorksheet(1);
    const rows = ws.getRows(1, ws.rowCount);

    // 创建或更新族战对象
    const title = ws.getCell('A1');
    const battleInfo = this.parseBattleTitle(String(title.value));

    const raidTitle1 = ws.getCell('A3');
    const raidTitle2 = ws.getCell('N3');
    const raidInfo1 = this.parseBattleRaidTitle(String(raidTitle1.value));
    const raidInfo2 = this.parseBattleRaidTitle(String(raidTitle2.value));

    const battleUpdateData = { ...battleInfo, raidType1: raidInfo1.type, raidType2: raidInfo2.type };
    await this.ds.manager.upsert(FamilyBattleEntity, battleUpdateData, ['date']);
    const battle = await this.ds.manager.findOneBy(FamilyBattleEntity, { date: battleInfo.date });

    // 团本信息
    type RaidItem = { uid: string; type: string; score: number; battleType: string; battleId: number };
    const raidData1: RaidItem[] = [];
    const raidData2: RaidItem[] = [];
    const raidLines = rows.slice(4);
    for (const line of raidLines) {
      const nameStr1 = String(line.getCell('B').value);
      const nameStr2 = String(line.getCell('O').value);
      if (nameStr1 !== 'null') {
        const uid1 = nameStr1.split('（')[1].replace('）', '');
        const score1 = Number(line.getCell('C').value);
        raidData1.push({ uid: uid1, type: raidInfo1.type, score: score1, battleType: 'battle', battleId: battle.id });
      }
      if (nameStr2 !== 'null') {
        const uid2 = nameStr2.split('（')[1].replace('）', '');
        const score2 = Number(line.getCell('P').value);
        raidData2.push({ uid: uid2, type: raidInfo2.type, score: score2, battleType: 'battle', battleId: battle.id });
      }
    }
    const raidData = raidData1.concat(raidData2);
    await this.ds.manager.upsert(FamilyRaidEntity, raidData, ['uid', 'type', 'battleType', 'battleId']);

    // 3v3信息
    type FightItem = {
      battleId: number;
      type: string;
      order: number;
      score: number;
      result: string;
      map: string;
      difficulty: string;
      effects: string[];
      ninjaInfo: { uid: string; score: number }[];
      mvp: string;
    };

    const fightLines = rows.slice(2);
    const fightTitleLines = fightLines.filter(line => {
      const cell = line.getCell('E');
      return cell.isMerged;
    });

    const fightInfos: FightItem[] = fightTitleLines.flatMap(titleLine => {
      const info = this.parseBattleFightTitle(String(titleLine.getCell('E').value));
      const { type, difficulty, score } = info;
      const list: exceljs.Row[] = [];
      let index = titleLine.number + 2;
      let value = '';
      while (value !== 'null') {
        value = String(ws.getCell(`E${index}`).value);
        if (value !== 'null') list.push(ws.getRow(index));
        index++;
      }
      return list.map((line, lineIndex) => {
        const order = lineIndex + 1;
        const result = String(line.getCell('E').value).split(/[（）]/)[1];
        const [map, effectsStr] = String(line.getCell('F').value).split(' ');
        const effects = effectsStr.split('+');
        const ninjaInfo: { uid: string; score: number }[] = [];
        let mvp = '';
        if (line.getCell('G').isMerged) {
          // 如果是单人战斗
          const uid = String(line.getCell('G').value).split(/[（）]/)[1];
          const score = Number(line.getCell('L').value);
          ninjaInfo.push({ uid, score });
        } else {
          // 如果是多人战斗
          for (let i = 0; i < 3; i++) {
            const uidCode = String.fromCharCode('G'.charCodeAt(0) + i * 2);
            const scoreCode = String.fromCharCode('H'.charCodeAt(0) + i * 2);
            const uid = String(line.getCell(uidCode).value).split(/[（）]/)[1];
            const score = Number(line.getCell(scoreCode).value);
            ninjaInfo.push({ uid, score });
          }
          const copy = [...ninjaInfo];
          copy.sort((a, b) => a.score - b.score);
          [{ uid: mvp }] = copy;
        }
        // FIXME：这个计算方式不准确，同分可能存在问题！
        return { battleId: battle.id, type, order, score, result, map, difficulty, effects, ninjaInfo, mvp };
      });
    });
    console.log(fightInfos);
    await this.ds.manager.upsert(FamilyFightEntity, fightInfos, ['battleId', 'type', 'order']);
  }

  async downloadFromUrl(url: string) {
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

  parseBattleTitle(title: string) {
    const info = title.split(' ');
    const [, , enemyName, , dateStr, result, scoreStr] = info;
    const date = dayjs(dateStr).toDate();
    const score = Number(scoreStr.split('：')[1]);
    return { enemyName, date, result, score };
  }

  parseBattleRaidTitle(title: string) {
    const [nameStr, scoreStr] = title.split(' ');
    const [, orderStr, type] = nameStr.split('*');
    const order = Number(orderStr);
    const score = Number(scoreStr.split('：')[1]);
    return { order, type, score };
  }

  parseBattleFightTitle(title: string) {
    const [type, difficulty, scoreStr] = title.split(/[（）]/);
    const score = Number(scoreStr.split('：')[1]);
    return { type, difficulty, score };
  }
}
