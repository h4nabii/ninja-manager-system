import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const curTime = () => dayjs().format("YYYY-MM-DD HH:mm:ss");
export const printCurTimeLine = () => {
  console.log("---------------------------------------------");
  console.log(`[bundle] \x1b[32mFINISHED\x1b[0m | ${curTime()} `);
  console.log("---------------------------------------------");
};

// 确保 prod 目录存在
const prodPath = path.resolve(__dirname, "..", "prod");
fsSync.mkdirSync(prodPath, { recursive: true });

// 获取 API、BACK 和 FRONT 的路径
const apiDir = path.resolve(__dirname, "..", "packages", "api");
const backDir = path.resolve(__dirname, "..", "packages", "back");
const frontDir = path.resolve(__dirname, "..", "packages", "front");
const mobileDir = path.resolve(__dirname, "..", "packages", "mobile");

/**
 * 打包构建产物
 */
export async function bundleAll() {
  await bundleApi();
  await bundleBack();
  // await bundleFront();
  await bundleMobile();
}

/**
 * 打包 API 的构建产物
 */
export async function bundleApi() {
  const distDir = path.join(apiDir, "dist");
  if (!fsSync.existsSync(distDir)) throw new Error("[bundle] 未找到 dist 目录，请先执行构建命令");
  const copyDestDir = path.join(prodPath, "api");
  if (fsSync.existsSync(copyDestDir)) fsSync.rmSync(copyDestDir, { recursive: true });
  await fs.mkdir(copyDestDir, { recursive: true });

  console.log("[bundle] 复制 API 的构建产物");
  const toCopy = ["dist", "public", "bootstrap.js", "package.json"];
  await Promise.all(
    toCopy.map(async (name) => {
      const form = path.resolve(apiDir, name);
      const to = path.join(copyDestDir, name);
      return await copyPath(form, to);
    }),
  );

  console.log("[bundle] 生成 API 压缩包");
  await zipDir("./prod/api", "./prod/api.zip");
  console.log("[bundle] api.zip 已生成");

  console.log("[bundle] 生成 API DIST 压缩包");
  await zipDir("./prod/api/dist", "./prod/api-dist.zip");
  console.log("[bundle] api-dist.zip 已生成");
}

/**
 * 打包 BACK 的构建产物
 */
export async function bundleBack() {
  const distDir = path.join(backDir, "dist");
  if (!fsSync.existsSync(distDir)) throw new Error("[bundle] 未找到 dist 目录，请先执行构建命令");
  const copyDestDir = path.join(prodPath, "back");
  if (fsSync.existsSync(copyDestDir)) fsSync.rmSync(copyDestDir, { recursive: true });
  await fs.mkdir(copyDestDir, { recursive: true });

  console.log("[bundle] 复制 BACK 的构建产物");
  await copyDir(distDir, copyDestDir);

  console.log("[bundle] 生成 BACK 压缩包");
  await zipDir("./prod/back", "./prod/back.zip");
  console.log("[bundle] back.zip 已生成");
}

/**
 * 打包 FRONT 的构建产物
 */
export async function bundleFront() {
  const distDir = path.join(frontDir, "dist");
  if (!fsSync.existsSync(distDir)) throw new Error("[bundle] 未找到 dist 目录，请先执行构建命令");
  const copyDestDir = path.join(prodPath, "front");
  if (fsSync.existsSync(copyDestDir)) fsSync.rmSync(copyDestDir, { recursive: true });
  await fs.mkdir(copyDestDir, { recursive: true });

  console.log("[bundle] 复制 FRONT 的构建产物");
  await copyDir(distDir, copyDestDir);

  console.log("[bundle] 生成 FRONT 压缩包");
  await zipDir("./prod/front", "./prod/front.zip");
  console.log("[bundle] front.zip 已生成");
}

/**
 * 打包 FRONT 的构建产物
 */
export async function bundleMobile() {
  const distDir = path.join(mobileDir, "dist");
  if (!fsSync.existsSync(distDir)) throw new Error("[bundle] 未找到 dist 目录，请先执行构建命令");
  const copyDestDir = path.join(prodPath, "front");
  if (fsSync.existsSync(copyDestDir)) fsSync.rmSync(copyDestDir, { recursive: true });
  await fs.mkdir(copyDestDir, { recursive: true });

  console.log("[bundle] 复制 MOBILE 的构建产物");
  await copyDir(distDir, copyDestDir);

  console.log("[bundle] 生成 MOBILE 压缩包");
  await zipDir("./prod/mobile", "./prod/mobile.zip");
  console.log("[bundle] mobile.zip 已生成");
}

/**
 * 移动文件或文件夹
 * @param {string} from
 * @param {string} dest
 */
async function copyPath(from, dest) {
  const fromPath = path.resolve(from);
  const destPath = path.resolve(dest);
  const stat = await fs.stat(fromPath);
  // 复制文件
  if (stat.isFile()) await fs.copyFile(fromPath, destPath);
  // 创建新目录并复制文件
  if (stat.isDirectory()) await copyDir(fromPath, destPath);
}

/**
 * 复制目录
 * @param fromDir {string}
 * @param destDir {string}
 */
async function copyDir(fromDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const dirFiles = await fs.readdir(fromDir);
  await Promise.all(
    dirFiles.map(async (name) => {
      const from = path.resolve(fromDir, name);
      const to = path.resolve(destDir, name);
      return await copyPath(from, to);
    }),
  );
}

/**
 * 压缩目录
 * @param dirPath {string} 目录
 * @param to {string} 压缩包路径
 */
async function zipDir(dirPath, to) {
  const arch = archiver("zip", { zlib: { level: 9 } });
  const output = fsSync.createWriteStream(to);
  arch.pipe(output);
  arch.directory(dirPath, false);
  await arch.finalize();
}
