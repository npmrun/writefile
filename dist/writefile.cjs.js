#!/usr/bin/env node
'use strict';

var ejs = require("ejs");
var path = require("path");
var fs = require("fs");
var currentPath = process.cwd();
var configPath = path.resolve(currentPath, 'writeFile.config.js');
var isExistConfig = fs.existsSync(configPath);
if (!isExistConfig) {
    throw new Error('根目录不存在配置文件');
}
try {
    var config = require(configPath);
    if (isExistConfig && !config.filelist) {
        throw new Error('配置文件不存在filelist字段');
    }
    if (isExistConfig && config.filelist && !Array.isArray(config.filelist)) {
        throw new Error('filelist字段不是一个数组');
    }
    if (isExistConfig && config.filelist && Array.isArray(config.filelist)) {
        config.filelist.forEach(function (file) {
            createForEach(file);
        });
    }
}
catch (error) {
    throw new Error(error);
}
function createForEach(params) {
    if (!params.use) {
        return;
    }
    var myFromKey = "from__";
    var myToKey = "to__";
    var getFrom = Object.keys(params).filter(function (key) {
        return key.startsWith(myFromKey);
    }).map(function (key) { return key.replace(myFromKey, ''); });
    var getTo = Object.keys(params).filter(function (key) {
        return key.startsWith(myToKey);
    }).map(function (key) { return key.replace(myToKey, ''); });
    getFrom.forEach(function (fromPath) {
        var toIndex = getTo.indexOf(fromPath);
        if (toIndex !== -1) {
            var fromMyPath = myFromKey + fromPath;
            var toMyPath = myToKey + getTo[getTo.indexOf(fromPath)];
            createTemplate(params[fromMyPath], params[toMyPath], params);
        }
    });
}
function createTemplate(fromOrigin, targetOrigin, params) {
    var rootView = path.resolve(currentPath, fromOrigin);
    var targetView = path.resolve(currentPath, targetOrigin);
    var dir = path.parse(targetView).dir;
    var isExistTargetViewDir = fs.existsSync(dir);
    var isExistTargetView = fs.existsSync(targetView);
    if (!isExistTargetView) {
        if (!isExistTargetViewDir) {
            fs.mkdirSync(dir, { recursive: true });
        }
        var originRoot = fs.readFileSync(rootView, { encoding: "utf8" });
        var html = ejs.render(originRoot, params);
        fs.writeFileSync(targetView, html);
    }
    else {
        throw "路径已存在，为了安全，不覆盖已存在的文件";
    }
}
//# sourceMappingURL=writefile.cjs.js.map
