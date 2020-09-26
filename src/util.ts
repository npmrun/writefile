const fs = require("fs");
const stat = fs.stat;

const util = {
  isExists(src: string, cb: (isExists: boolean) => void) {
    // 检查文件是否存在于当前目录中。
    fs.access(src, fs.constants.F_OK, (err: Error) => {
      cb(err ? false : true);
    });
  },
  exists(src: string, dst: string, callback: (a: string, b: string) => void) {
    // 检查文件是否存在于当前目录中。
    fs.access(dst, fs.constants.F_OK, (err: Error) => {
      if (err) {
        fs.mkdir(dst, function () {
          //创建目录
          callback(src, dst);
        });
      } else {
        callback(src, dst);
      }
    });
  },
  copyDir(
    src: string,
    dst: string,
    cb?: (fromPath: string, toPath: string) => void
  ) {
    fs.readdir(src, function (err: Error, paths: [string]) {
      if (err) {
        throw err;
      }
      paths.forEach(function (path) {
        var _src = src + "/" + path;
        var _dst = dst + "/" + path;
        stat(_src, function (err: Error, st: any) {
          if (err) {
            throw err;
          }
          if (st.isFile()) {
            if (cb) {
              cb(_src, _dst);
            } else {
              const originRoot = fs.readFileSync(_src, { encoding: "utf8" });
              fs.writeFileSync(_dst, originRoot);
            }
          } else if (st.isDirectory()) {
            util.exists(_src, _dst, (src, dst) => {
              util.copyDir(src, dst, cb);
            });
          }
        });
      });
    });
  },
};

export default util;
