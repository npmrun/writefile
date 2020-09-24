# @noderun/writefile

一个轻量化的单文件模板生成器，目前只支持配置文件生成！

 * ejs渲染

目前主要用于做后台模板的时候的省去一些复制模板是需要修修改改，删删减减的东西!

## 用法

根目录写好配置文件

执行`writefile`。

配置文件`writeFile.config.js`示例：

`from__`开头对应`to__`，可采用多个文件模板
```
module.exports = {
  filelist:[
    //字段都可用于模板变量
    {
      use: false, // 不执行，ture时执行
      viewName:'添加专区活动商品',
      apiName:'configShare',
      view: "addZoneGoods",
      apiPath: "sms/addZoneGoods.js",
      from__View: "./createTemplate/add.vue",
      from__Api: "./createTemplate/api.js",
      to__View: "./admin/src/views/sms/addZoneGoods/index.vue",
      to__Api: "./admin/src/api/sms/addZoneGoods.js",
    }
  ]
}
```