// #!/usr/bin/env node
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

interface IFileList{
  use:boolean;
  [propsData:string]:any;
}

const currentPath = process.cwd();

const configPath = path.resolve(currentPath,'writeFile.config.js');
const isExistConfig = fs.existsSync(configPath);

if (!isExistConfig) {
  throw new Error('根目录不存在配置文件')
}

try {
  let config = require(configPath)
  if (isExistConfig&&!config.filelist) {
    throw new Error('配置文件不存在filelist字段')
  }
  if (isExistConfig&&config.filelist && !Array.isArray(config.filelist)) {
    throw new Error('filelist字段不是一个数组')
  }
  if (isExistConfig&&config.filelist && Array.isArray(config.filelist)) {
    config.filelist.forEach((file:IFileList) => {
      createForEach(file)
    })
  }
} catch (error) {
  throw new Error(error)
}

function createForEach(params:IFileList) {
  if (!params.use) {
    return
  }
  const myFromKey = "from__"
  const myToKey = "to__"
  let getFrom = Object.keys(params).filter(key =>{
    return key.startsWith(myFromKey);
  }).map(key =>key.replace(myFromKey,''));
  let getTo = Object.keys(params).filter(key =>{
    return key.startsWith(myToKey);
  }).map(key =>key.replace(myToKey,''));
  getFrom.forEach(fromPath => {
    let toIndex = getTo.indexOf(fromPath);
    if (toIndex !== -1) {
      const fromMyPath = myFromKey+fromPath;
      const toMyPath = myToKey+getTo[getTo.indexOf(fromPath)]
      createTemplate(
        params[fromMyPath],
        params[toMyPath],
        params
      );
    }
  })
}

function createTemplate(fromOrigin:string, targetOrigin:string, params:IFileList) {
  const rootView = path.resolve(currentPath,fromOrigin);
  const targetView = path.resolve(currentPath,targetOrigin);
  const { dir } = path.parse(targetView);
  const isExistTargetViewDir = fs.existsSync(dir);
  const isExistTargetView = fs.existsSync(targetView);
  if (!isExistTargetView) {
    if (!isExistTargetViewDir) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const originRoot = fs.readFileSync(rootView, { encoding: "utf8" });
    const html = ejs.render(originRoot, params);
    fs.writeFileSync(targetView, html);
  } else {
    throw "路径已存在，为了安全，不覆盖已存在的文件";
  }
}
