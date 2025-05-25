import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { Application } from '@midwayjs/koa';
import * as dayjs from 'dayjs';
import { App, Provide } from '@midwayjs/core';
import { nanoid } from 'nanoid';

const STATIC_URL = '/public';

/**
 * 文件上传 Service
 */
@Provide()
export class UploadService {
  @App()
  app: Application;

  /**
   * 获取保存目录（/public/uploads/<YYYYMMDD>/），不存在则创建
   */
  async getSaveDir() {
    const dirName = dayjs().format('YYYYMMDD');
    const savePath = path.join(this.app.getAppDir(), STATIC_URL, 'uploads', dirName);
    try {
      await fs.stat(savePath);
    } catch {
      await fs.mkdir(savePath, { recursive: true });
    }
    return savePath;
  }

  /**
   * 获取通过网络读取文件的 URL
   * @param fileName 文件名
   */
  getApiUrl(fileName: string) {
    return `${STATIC_URL}/uploads/${dayjs().format('YYYYMMDD')}/${fileName}`;
  }

  /**
   * 保存 Midway 预存的临时文件
   * @param files 临时文件信息
   */
  async saveTempFiles(files: TempFile[]) {
    const fileInfos: FileInfo[] = [];
    for (const file of files) {
      const url = await this.saveFile(file.data);
      const name = file.filename;
      fileInfos.push({ name, url });
    }
    return fileInfos;
  }

  /**
   * 保存临时文件
   * @param tempPath 临时文件路径
   */
  async saveFile(tempPath: string) {
    try {
      // 读取文件
      const data = await fs.readFile(tempPath);
      // 构建保存路径
      const saveDir = await this.getSaveDir();
      const fileName = `${nanoid()}${path.extname(tempPath)}`;
      const filePath = path.join(saveDir, fileName);
      // 保存文件，生成前端文件 URL
      await fs.writeFile(filePath, new Uint8Array(data.buffer));
      return this.getApiUrl(fileName);
    } catch {
      console.error('文件保存失败');
      return '';
    }
  }
}
