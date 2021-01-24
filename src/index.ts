const path = require("path");
const fs = require("fs");
const stat = fs.stat;
import func from "./func";
import ProConfig from "./config";
import { IFileList } from "./Interface";

let argu = process.argv.slice(2);
let fromDir = argu[0];
let toDir = argu[1];
type ITpes = {
  [propsName: string]: any;
};
let opts: ITpes = {};
argu.slice(2).forEach((v) => {
  let argu = v.split("=");
  if (argu) {
    opts[argu[0]] = argu[1];
  }
});

const currentPath = process.cwd();

func.path = currentPath;

const configPath = path.resolve(currentPath, ProConfig.configFileName);
const isExistConfig = fs.existsSync(configPath);

if (fromDir || toDir) {
  if (
    !fs.existsSync(path.resolve(currentPath, fromDir))
  ) {
    throw new Error("没有对应模板目录");
  }
  if (!toDir) {
    throw new Error("没有目标文件");
  }
  fromDir = path.resolve(currentPath, fromDir);
  toDir = path.resolve(currentPath, toDir);
  stat(fromDir, (err: Error, st: any) => {
    if (err) {
      throw err;
    }
    if (st.isFile()) {
      const json = {
        use: true,
        useDir: false,
        useFile: true,
        from__View: fromDir,
        to__View: toDir,
        ...opts
      };
      func.createForEach(json);
    } else if (st.isDirectory()) {
      const json = {
        use: true,
        useDir: true,
        useFile: false,
        fromDir__View: fromDir,
        toDir__View: toDir,
        ...opts
      };
      func.createDir(json);
    }
  });
} else if(isExistConfig&&(!fromDir && !toDir)){
  try {
    let config = require(configPath);
    if (isExistConfig && !config[ProConfig.configFileListName]) {
      throw new Error(`配置文件不存在${ProConfig.configFileListName}字段`);
    }
    if (
      isExistConfig &&
      config[ProConfig.configFileListName] &&
      !Array.isArray(config[ProConfig.configFileListName])
    ) {
      throw new Error(`${ProConfig.configFileListName}字段不是一个数组`);
    }
    if (
      isExistConfig &&
      config[ProConfig.configFileListName] &&
      Array.isArray(config[ProConfig.configFileListName])
    ) {
      config[ProConfig.configFileListName].forEach((file: IFileList) => {
        // 不使用该模块
        if (!file.use) {
          return;
        }
        // 使用文件夹模板
        if (file.useDir) {
          func.createDir(file);
        }
        // 使用文件模板
        if (file.useFile) {
          func.createForEach(file);
        }
      });
    }
  } catch (error) {
    throw new Error(error);
  }
}else {
  throw new Error("命令行模式少了目录，配置文件模式少了配置");
}
