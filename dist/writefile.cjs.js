#!/usr/bin/env node
'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

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

var ProConfig = {
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
        var myFromKey = ProConfig.dirFromKey;
        var myToKey = ProConfig.dirToKey;
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
                        throw ProConfig.dirErrNoForce;
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
                throw ProConfig.dirErrNoExist;
            }
        });
    },
    createForEach: function (params) {
        var _this = this;
        if (!params.useFile) {
            return;
        }
        var myFromKey = ProConfig.fileFromKey;
        var myToKey = ProConfig.fileToKey;
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
            throw ProConfig.fileErrNoForce;
        }
    },
};

var path$1 = require("path");
var fs$2 = require("fs");
var stat$1 = fs$2.stat;
var argu = process.argv.slice(2);
var fromDir = argu[0];
var toDir = argu[1];
var opts = {};
argu.slice(2).forEach(function (v) {
    var argu = v.split("=");
    if (argu) {
        opts[argu[0]] = argu[1];
    }
});
var currentPath$1 = process.cwd();
func.path = currentPath$1;
var configPath = path$1.resolve(currentPath$1, ProConfig.configFileName);
var isExistConfig = fs$2.existsSync(configPath);
if (fromDir || toDir) {
    if (!fs$2.existsSync(path$1.resolve(currentPath$1, fromDir))) {
        throw new Error("没有对应模板目录");
    }
    if (!toDir) {
        throw new Error("没有目标文件");
    }
    fromDir = path$1.resolve(currentPath$1, fromDir);
    toDir = path$1.resolve(currentPath$1, toDir);
    stat$1(fromDir, function (err, st) {
        if (err) {
            throw err;
        }
        if (st.isFile()) {
            var json = __assign({ use: true, useDir: false, useFile: true, from__View: fromDir, to__View: toDir }, opts);
            func.createForEach(json);
        }
        else if (st.isDirectory()) {
            var json = __assign({ use: true, useDir: true, useFile: false, fromDir__View: fromDir, toDir__View: toDir }, opts);
            func.createDir(json);
        }
    });
}
else if (isExistConfig && (!fromDir && !toDir)) {
    try {
        var config = require(configPath);
        if (isExistConfig && !config[ProConfig.configFileListName]) {
            throw new Error("\u914D\u7F6E\u6587\u4EF6\u4E0D\u5B58\u5728" + ProConfig.configFileListName + "\u5B57\u6BB5");
        }
        if (isExistConfig &&
            config[ProConfig.configFileListName] &&
            !Array.isArray(config[ProConfig.configFileListName])) {
            throw new Error(ProConfig.configFileListName + "\u5B57\u6BB5\u4E0D\u662F\u4E00\u4E2A\u6570\u7EC4");
        }
        if (isExistConfig &&
            config[ProConfig.configFileListName] &&
            Array.isArray(config[ProConfig.configFileListName])) {
            config[ProConfig.configFileListName].forEach(function (file) {
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
}
else {
    throw new Error("命令行模式少了目录，配置文件模式少了配置");
}
//# sourceMappingURL=writefile.cjs.js.map
