# Changelog
本文档将从版本v1.0.14开始列出后续的每个版本的主要更改
有关详细的更改日志，请查看GitHub发布页面：https://github.com/ssmNydia/mpd-cli/releases

# v1.1.9 (2020-05-29)

**修复**

* `F` 修复已知bug


# v1.1.8 (2020-05-29)

**新增&修复**

* `A` 新增 mpd.config.js 的配置 字段 imgBase64 ，图片大小在指定b内编译成base64格式，默认开启且值为 1024。设置false时，图片将不编译成base64格式。
* `A` 新增 mpd.config.js 的配置字段 debug，用于控制打包时是否去掉console信息；默认false，去掉。
* `A` 新增 秘密功能。^_^
* `U` 更新 打包文件时，assets目录内 以`_` 开头命名的目录将被忽略，不再拷贝到打包目录。
* `F` 修复已知的bug


# v1.1.7

**新增**

* 全局引入配置新增字段 islast 和 ignore
* 支持在mpd.config.js内配置是否兼容IE8，要开启兼容IE8，必须开启useUglify。默认开启。 ` ie8: true `
* 支持在mpd.config.js内配置是否启用uglify，若关闭uglify，则ie8也将关闭。默认开启。 ` useUglify: true `

# v1.1.6

**修复**

* 修复打包后HTML的外部引用资源路径错误

# v1.1.5

**修复**

* 修复打包后HTML的同名资源路径错误

# v1.1.4

**修复**

* 修复 @babel/runtime-corejs3 丢失


# v1.1.3

**优化&修复：**

* 修复已知bug  #23
* 优化配置资源的路径打包后自动补上前缀 #22
* 优化组件列表页的样式排版
* 调整了 stylelint 的检查规则



# v1.1.0

**优化、调整&修复：**

* 创建项目时，增加了询问交互
* 支持本地多开mpd项目，端口号会自增解决冲突问题
* 本地开发环境时，取消eslint检查；调整到打包环境执行，若有需要可通过设置 ```openLint``` 为 true，在开发环境开启检测（将进行eslint和stylelint的双项检测）
* 修复了组件demo页面，引入第三方库在组件脚本后的问题
* 本地项目无需执行 ```npm i``` 

**新增以下功能：**

* 新增stylelint检查
* mpd.config.js 新增字段 ```openHttps、openLint、favicon```  ，其中 ```favicon``` 是build的特有字段，两个open的是dev的特有字段
* Package.json 新增字段 ```mpd-cli-version``` 是创建项目时的mpd-cli版本号
* 支持本地开启https服务
* 支持添加页面和组件时，通过指令 ```-m``` 切换为M版HTML #16

## v1.1.2

* 修改npm的描述和关键词

## v1.1.1

* 删除多余的输出信息


# v1.0

## v1.0.16

- 修复14版后组件demo页面无法正常访问的bug



## v1.0.15

- 允许router携带query参数  ``` /user_1?city=gz```

  

## 	v1.0.14

- 修复当页面命名符合设定的路由规则时，获取的资源内容变为HTML页面内容的bug
- 更新 README.md
- 增加 CHANGELOG.md