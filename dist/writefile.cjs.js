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

var config = {
    configFileName: "writefile.config.js",
    configFileListName: "filelist",
    dirFromKey: "fromDir__",
    dirToKey: "toDir__",
    dirErrNoForce: "目标路径已存在，强制覆盖请使用字段force",
    dirErrNoExist: "不存在源路径",
    fileFromKey: "from__",
    fileToKey: "to__",
    fileErrNoForce: "路径已存在，为了安全，不覆盖已存在的文件",
};

var ejs = require("ejs");
var path = require("path");
var fs$1 = require("fs");
var currentPath = "";
var func = {
    set path(value) {
        currentPath = value;
    },
    get path() {
        return currentPath;
    },
    createDir: function (params) {
        var _this = this;
        if (!params.useDir) {
            return;
        }
        var myFromKey = config.dirFromKey;
        var myToKey = config.dirToKey;
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
                _this.createDirTemplates(params[fromMyPath], params[toMyPath], params, params.force);
            }
        });
    },
    createDirTemplates: function (fromOrigin, targetOrigin, params, force) {
        if (force === void 0) { force = false; }
        var rootView = path.resolve(this.path, fromOrigin);
        var targetView = path.resolve(this.path, targetOrigin);
        util.isExists(rootView, function (isExists) {
            if (isExists) {
                util.isExists(targetView, function (isExistsTarget) {
                    if (isExistsTarget && !force) {
                        throw config.dirErrNoForce;
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
                throw config.dirErrNoExist;
            }
        });
    },
    createForEach: function (params) {
        var _this = this;
        if (!params.useFile) {
            return;
        }
        var myFromKey = config.fileFromKey;
        var myToKey = config.fileToKey;
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
                _this.createTemplate(params[fromMyPath], params[toMyPath], params, params.force);
            }
        });
    },
    createTemplate: function (fromOrigin, targetOrigin, params, force) {
        if (force === void 0) { force = false; }
        var rootView = path.resolve(this.path, fromOrigin);
        var targetView = path.resolve(this.path, targetOrigin);
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
            throw config.fileErrNoForce;
        }
    },
};

var path$1 = require("path");
var fs$2 = require("fs");
var currentPath$1 = process.cwd();
func.path = currentPath$1;
var configPath = path$1.resolve(currentPath$1, config.configFileName);
var isExistConfig = fs$2.existsSync(configPath);
if (!isExistConfig) {
    throw new Error("根目录不存在配置文件");
}
try {
    var config_1 = require(configPath);
    if (isExistConfig && !config_1[config_1.configFileListName]) {
        throw new Error("\u914D\u7F6E\u6587\u4EF6\u4E0D\u5B58\u5728" + config_1.configFileListName + "\u5B57\u6BB5");
    }
    if (isExistConfig && config_1[config_1.configFileListName] && !Array.isArray(config_1[config_1.configFileListName])) {
        throw new Error(config_1.configFileListName + "\u5B57\u6BB5\u4E0D\u662F\u4E00\u4E2A\u6570\u7EC4");
    }
    if (isExistConfig && config_1[config_1.configFileListName] && Array.isArray(config_1[config_1.configFileListName])) {
        config_1[config_1.configFileListName].forEach(function (file) {
            if (!file.use) {
                return;
            }
            if (file.useDir) {
                func.createDir(file);
            }
            if (file.useFile) {
                func.createForEach(file);
            }
        });
    }
}
catch (error) {
    throw new Error(error);
}
//# sourceMappingURL=writefile.cjs.js.map
