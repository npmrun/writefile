const path = require("path");
const fs = require("fs");
import func from "./func";
import config from "./config";
import {IFileList} from "./Interface";

const currentPath = process.cwd();

func.path = currentPath;

const configPath = path.resolve(currentPath, config.configFileName);
const isExistConfig = fs.existsSync(configPath);

if (!isExistConfig) {
  throw new Error("根目录不存在配置文件");
}

try {
  let config = require(configPath);
  if (isExistConfig && !config[config.configFileListName]) {
    throw new Error(`配置文件不存在${config.configFileListName}字段`);
  }
  if (isExistConfig && config[config.configFileListName] && !Array.isArray(config[config.configFileListName])) {
    throw new Error(`${config.configFileListName}字段不是一个数组`);
  }
  if (isExistConfig && config[config.configFileListName] && Array.isArray(config[config.configFileListName])) {
    config[config.configFileListName].forEach((file: IFileList) => {
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