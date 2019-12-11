# Changelog
本文档将从版本v1.0.14开始列出后续的每个版本的主要更改
有关详细的更改日志，请查看GitHub发布页面：https://github.com/ssmNydia/mpd-cli/releases

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


# v1.0

## v1.0.16

- 修复14版后组件demo页面无法正常访问的bug



## v1.0.15

- 允许router携带query参数  ``` /user_1?city=gz```

  

## 	v1.0.14

- 修复当页面命名符合设定的路由规则时，获取的资源内容变为HTML页面内容的bug
- 更新 README.md
- 增加 CHANGELOG.md