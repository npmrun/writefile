module.exports = {
  filelist:[
    {
      use: true,  // 是否启用这个生成模板
      useDir: true, // 是否启用文件夹生成模板,可使用fromDir__
      useFile: true, // 是否启用文件生成模板,可使用from__
      force: false,  // 是否启用强制覆盖本地文件
      name:"test",
      fromDir__Dir: "./temp",
      toDir__Dir: "./output"
    }
  ]
}