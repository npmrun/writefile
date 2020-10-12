const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
import {IFileList} from "./Interface";
import util from "./util";
import config from "./config";

let currentPath = "";

export default {
  set path(value) {
    currentPath = value;
  },
  get path() {
    return currentPath;
  },
  createDir(params: IFileList) {
    if (!params.useDir) {
      return;
    }
    const myFromKey = config.dirFromKey;
    const myToKey = config.dirToKey;
    let getFrom = Object.keys(params)
      .filter((key) => {
        return key.startsWith(myFromKey);
      })
      .map((key) => key.replace(myFromKey, ""));
    let getTo = Object.keys(params)
      .filter((key) => {
        return key.startsWith(myToKey);
      })
      .map((key) => key.replace(myToKey, ""));
    getFrom.forEach((fromPath) => {
      let toIndex = getTo.indexOf(fromPath);
      if (toIndex !== -1) {
        const fromMyPath = myFromKey + fromPath;
        const toMyPath = myToKey + getTo[getTo.indexOf(fromPath)];
        this.createDirTemplates(
          params[fromMyPath],
          params[toMyPath],
          params,
          params.force
        );
      }
    });
  },
  createDirTemplates(
    fromOrigin: string,
    targetOrigin: string,
    params: IFileList,
    force: boolean = false
  ) {
    const rootView = path.resolve(this.path, fromOrigin);
    const targetView = path.resolve(this.path, targetOrigin);
    util.isExists(rootView, (isExists) => {
      if (isExists) {
        util.isExists(targetView, (isExistsTarget) => {
          if (isExistsTarget && !force) {
            throw config.dirErrNoForce;
          } else {
            const isExistTargetViewDir = fs.existsSync(targetView);
            if (!isExistTargetViewDir) {
              fs.mkdirSync(targetView, { recursive: true });
            }
            util.copyDir(
              rootView,
              targetView,
              (fromPath: string, toPath: string) => {
                const originRoot = fs.readFileSync(fromPath, {
                  encoding: "utf8",
                });
                const html = ejs.render(originRoot, params);
                fs.writeFileSync(toPath, html);
              }
            );
          }
        });
      } else {
        throw config.dirErrNoExist;
      }
    });
  },
  createForEach(params: IFileList) {
    if (!params.useFile) {
      return;
    }
    const myFromKey = config.fileFromKey;
    const myToKey = config.fileToKey;
    let getFrom = Object.keys(params)
      .filter((key) => {
        return key.startsWith(myFromKey);
      })
      .map((key) => key.replace(myFromKey, ""));
    let getTo = Object.keys(params)
      .filter((key) => {
        return key.startsWith(myToKey);
      })
      .map((key) => key.replace(myToKey, ""));
    getFrom.forEach((fromPath) => {
      let toIndex = getTo.indexOf(fromPath);
      if (toIndex !== -1) {
        const fromMyPath = myFromKey + fromPath;
        const toMyPath = myToKey + getTo[getTo.indexOf(fromPath)];
        this.createTemplate(
          params[fromMyPath],
          params[toMyPath],
          params,
          params.force
        );
      }
    });
  },
  createTemplate(
    fromOrigin: string,
    targetOrigin: string,
    params: IFileList,
    force: boolean = false
  ) {
    const rootView = path.resolve(this.path, fromOrigin);
    const targetView = path.resolve(this.path, targetOrigin);
    const { dir } = path.parse(targetView);
    const isExistTargetViewDir = fs.existsSync(dir);
    const isExistTargetView = fs.existsSync(targetView);
    if (!isExistTargetView || force) {
      if (!isExistTargetViewDir) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const originRoot = fs.readFileSync(rootView, { encoding: "utf8" });
      const html = ejs.render(originRoot, params);
      fs.writeFileSync(targetView, html);
    } else {
      throw config.fileErrNoForce;
    }
  },
};
