# mpd-cli
多页面开发脚手架

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## 安装
请确认系统环境符合以下标准：Node.js 8.x+, npm 5.8.0+

``` bash
$ npm i -g mpd-cli
```

## 使用说明

创建项目

``` bash
$ mpd init
```

新增页面或组件

在项目根目录下运行 `mpd init`

``` bash
# 使用 -p 添加名为 demo的页面
$ mpd add -p demo

# 使用 -c 添加名为 test的组件
$ mpd add -c test

# 使用 -r 可以对已有页面进行重命名
$ mpd add -p -r index demo

# 使用 -f 可以强制覆盖同名页面
$ mpd add -p -f index

# 使用 -d 下载最新模版添加页面
$ mpd add -p -d index
```

启动调试服务器，在项目根目录运行

``` bash
$ mpd dev
```

构建打包项目，在项目根目录运行

``` bash
$ mpd build
```

另外，可在 `mpd.config.js` 中的plugins对项目进行第三方库引入的详细配置；可在 `router.js` 中对项目路由进一步配置，来达到同步线上场景的访问路径。