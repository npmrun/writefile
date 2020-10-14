const path = require("path");
const fs = require("fs");
import func from "./func";
import ProConfig from "./config";
import {IFileList} from "./Interface";

const currentPath = process.cwd();

func.path = currentPath;

const configPath = path.resolve(currentPath, ProConfig.configFileName);
const isExistConfig = fs.existsSync(configPath);

if (!isExistConfig) {
  throw new Error("根目录不存在配置文件");
}

try {
  let config = require(configPath);
  if (isExistConfig && !config[ProConfig.configFileListName]) {
    throw new Error(`配置文件不存在${ProConfig.configFileListName}字段`);
  }
  if (isExistConfig && config[ProConfig.configFileListName] && !Array.isArray(config[ProConfig.configFileListName])) {
    throw new Error(`${ProConfig.configFileListName}字段不是一个数组`);
  }
  if (isExistConfig && config[ProConfig.configFileListName] && Array.isArray(config[ProConfig.configFileListName])) {
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