import * as exceljs from 'exceljs';
import * as dayjs from 'dayjs';
import { Inject, Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { ImportService } from './import.service';
import { FamilyBattleEntity } from '../../entity/family-battle.entity';
import { FamilyRaidEntity } from '../../entity/family-raid.entity';
import { FamilyFightEntity } from '../../entity/family-fight.entity';

@Provide()
export class ImportBattleService {
  @InjectDataSource()
  ds: DataSource;

  @Inject()
  importService: ImportService;

  async deelImport(filePath: string) {
    await this.parseExcel(filePath);
  }

  async parseExcel(filePath: string) {
    const { ws, rows } = await this.importService.readFile(filePath);

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
    if (!battle) throw new Error('未找到对应的族战记录');

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
          mvp = uid;
          ninjaInfo.push({ uid, score });
        } else {
          // 如果是多人战斗
          for (let i = 0; i < 3; i++) {
            const uidCode = String.fromCharCode('G'.charCodeAt(0) + i * 2);
            const scoreCode = String.fromCharCode('H'.charCodeAt(0) + i * 2);
            const uid = String(line.getCell(uidCode).value).split(/[（）]/)[1];
            const score = Number(line.getCell(scoreCode).value);
            if (uid) ninjaInfo.push({ uid, score });
          }
          const copy = [...ninjaInfo];
          copy.sort((a, b) => b.score - a.score);
          [{ uid: mvp = '' }] = copy;
          // console.log(copy, '////////');
        }
        // FIXME：这个计算方式不准确，同分可能存在问题！
        return { battleId: battle.id, type, order, score, result, map, difficulty, effects, ninjaInfo, mvp };
      });
    });
    // console.log(fightInfos);
    // console.log('?//////////////////////////');
    await this.ds.manager.upsert(FamilyFightEntity, fightInfos, ['battleId', 'type', 'order']);
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
