# @noderun/writefile

一个轻量化的单文件模板生成器，目前只支持配置文件生成！

 * ejs渲染

目前主要用于做后台模板的时候的省去一些复制模板是需要修修改改，删删减减的东西!

## 用法

根目录写好配置文件

执行`writefile`。

配置文件`writefile.config.js`示例：

`from__`开头对应`to__`，可采用多个文件模板  
`fromDir__`开头对应`toDir__`，可采用文件夹模板，直接复制整个文件夹

> 文件夹模板跟文件模版的目标路径请务必不要重合，否则会导致其中一个的数据被覆盖。

```
module.exports = {
  filelist:[
    //字段都可用于模板变量
    {
      use: true,  // 是否启用这个生成模板
      useDir: true, // 是否启用文件夹生成模板,可使用fromDir__
      useFile: true, // 是否启用文件生成模板,可使用from__
      force: false,  // 是否启用强制覆盖本地文件
      fromDir__Dir: "./temp", // 文件夹模板
      toDir__Dir: "./output",  // 文件夹模板生成路径
      from__View: "./createTemplate/add.vue",
      from__Api: "./createTemplate/api.js",
      to__View: "./admin/src/views/sms/addZoneGoods/index.vue",
      to__Api: "./admin/src/api/sms/addZoneGoods.js",
    }
  ]
}
```