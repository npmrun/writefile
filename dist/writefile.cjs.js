#!/usr/bin/env node
'use strict';

var fs = require("fs");
var stat = fs.stat;
var util = {
    isExists: function (src, cb) {
        fs.access(src, fs.constants.F_OK, function (err) {
            cb(err ? false : true);
        });
    },
    exists: function (src, dst, callback) {
        fs.access(dst, fs.constants.F_OK, function (err) {
            if (err) {
                fs.mkdir(dst, function () {
                    callback(src, dst);
                });
            }
            else {
                callback(src, dst);
            }
        });
    },
    copyDir: function (src, dst, cb) {
        fs.readdir(src, function (err, paths) {
            if (err) {
                throw err;
            }
            paths.forEach(function (path) {
                var _src = src + "/" + path;
                var _dst = dst + "/" + path;
                stat(_src, function (err, st) {
                    if (err) {
                        throw err;
                    }
                    if (st.isFile()) {
                        if (cb) {
                            cb(_src, _dst);
                        }
                        else {
                            var originRoot = fs.readFileSync(_src, { encoding: "utf8" });
                            fs.writeFileSync(_dst, originRoot);
                        }
                    }
                    else if (st.isDirectory()) {
                        util.exists(_src, _dst, function (src, dst) {
                            util.copyDir(src, dst, cb);
                        });
                    }
                });
            });
        });
    },
};

var ejs = require("ejs");
var path = require("path");
var fs$1 = require("fs");
var currentPath = process.cwd();
var configPath = path.resolve(currentPath, "writeFile.config.js");
var isExistConfig = fs$1.existsSync(configPath);
if (!isExistConfig) {
    throw new Error("根目录不存在配置文件");
}
try {
    var config = require(configPath);
    if (isExistConfig && !config.filelist) {
        throw new Error("配置文件不存在filelist字段");
    }
    if (isExistConfig && config.filelist && !Array.isArray(config.filelist)) {
        throw new Error("filelist字段不是一个数组");
    }
    if (isExistConfig && config.filelist && Array.isArray(config.filelist)) {
        config.filelist.forEach(function (file) {
            if (!file.use) {
                return;
            }
            if (file.useDir) {
                createDir(file);
            }
            if (file.useFile) {
                createForEach(file);
            }
        });
    }
}
catch (error) {
    throw new Error(error);
}
function createDir(params) {
    if (!params.useDir) {
        return;
    }
    var myFromKey = "fromDir__";
    var myToKey = "toDir__";
    var getFrom = Object.keys(params)
        .filter(function (key) {
        return key.startsWith(myFromKey);
    })
        .map(function (key) { return key.replace(myFromKey, ""); });
    var getTo = Object.keys(params)
        .filter(function (key) {
        return key.startsWith(myToKey);
    })
        .map(function (key) { return key.replace(myToKey, ""); });
    getFrom.forEach(function (fromPath) {
        var toIndex = getTo.indexOf(fromPath);
        if (toIndex !== -1) {
            var fromMyPath = myFromKey + fromPath;
            var toMyPath = myToKey + getTo[getTo.indexOf(fromPath)];
            createDirTemplates(params[fromMyPath], params[toMyPath], params, params.force);
        }
    });
}
function createDirTemplates(fromOrigin, targetOrigin, params, force) {
    if (force === void 0) { force = false; }
    var rootView = path.resolve(currentPath, fromOrigin);
    var targetView = path.resolve(currentPath, targetOrigin);
    util.isExists(rootView, function (isExists) {
        if (isExists) {
            util.isExists(targetView, function (isExistsTarget) {
                if (isExistsTarget && !force) {
                    throw "目标路径已存在，强制覆盖请使用字段force";
                }
                else {
                    var isExistTargetViewDir = fs$1.existsSync(targetView);
                    if (!isExistTargetViewDir) {
                        fs$1.mkdirSync(targetView, { recursive: true });
                    }
                    util.copyDir(rootView, targetView, function (fromPath, toPath) {
                        var originRoot = fs$1.readFileSync(fromPath, {
                            encoding: "utf8",
                        });
                        var html = ejs.render(originRoot, params);
                        fs$1.writeFileSync(toPath, html);
                    });
                }
            });
        }
        else {
            throw "不存在源路径";
        }
    });
}
function createForEach(params) {
    if (!params.useFile) {
        return;
    }
    var myFromKey = "from__";
    var myToKey = "to__";
    var getFrom = Object.keys(params)
        .filter(function (key) {
        return key.startsWith(myFromKey);
    })
        .map(function (key) { return key.replace(myFromKey, ""); });
    var getTo = Object.keys(params)
        .filter(function (key) {
        return key.startsWith(myToKey);
    })
        .map(function (key) { return key.replace(myToKey, ""); });
    getFrom.forEach(function (fromPath) {
        var toIndex = getTo.indexOf(fromPath);
        if (toIndex !== -1) {
            var fromMyPath = myFromKey + fromPath;
            var toMyPath = myToKey + getTo[getTo.indexOf(fromPath)];
            createTemplate(params[fromMyPath], params[toMyPath], params, params.force);
        }
    });
}
function createTemplate(fromOrigin, targetOrigin, params, force) {
    if (force === void 0) { force = false; }
    var rootView = path.resolve(currentPath, fromOrigin);
    var targetView = path.resolve(currentPath, targetOrigin);
    var dir = path.parse(targetView).dir;
    var isExistTargetViewDir = fs$1.existsSync(dir);
    var isExistTargetView = fs$1.existsSync(targetView);
    if (!isExistTargetView || force) {
        if (!isExistTargetViewDir) {
            fs$1.mkdirSync(dir, { recursive: true });
        }
        var originRoot = fs$1.readFileSync(rootView, { encoding: "utf8" });
        var html = ejs.render(originRoot, params);
        fs$1.writeFileSync(targetView, html);
    }
    else {
        throw "路径已存在，为了安全，不覆盖已存在的文件";
    }
}
//# sourceMappingURL=writefile.cjs.js.map
