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

### 创建项目

在项目根目录下运行 `mpd init`

按提示完成创建；

进入项目后，执行 `npm i`

``` bash
$ mpd init
$ cd 刚才填写的项目名称
$ npm i
```

### 新增页面或组件

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

## mpd.config.js

项目配置说明

```javascript
module.exports = {
  /**
   * 第三方库引入
   * @type {Array}
   */
  plugins:{
    /**
     * 所有页面都引入的库
     * @type {Array}
     */
    global:[
        /* 直接填入需要引入库的路径 */
        'https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js',
    ],
    /**
     * 指定页面引入库
     * @type {Array}
     */
    assign:[
        {
            pages:['index'], // 填写页面名称；支持多个页面共用一套引入方案
            urls:[
                'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.5.0/css/swiper.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.5.0/js/swiper.min.js'
            ]
        }
    ]
  },
  /*
  * dev 和 build 拥有一样的可配置项:
  * dir, output
   */
  dev:{
    /**
     * 启用代理 启用代理需要配置 proxy
     * @type {Boolean} 默认false
     */
    openProxy: true,
    /**
     * 设置代理对应关系，可配置多个
     * @type {Object}
     */
    proxy:{
      '/api': {
        target: 'http://api.mpd-cli.com/',
        changeOrigin: true,
        pathRewrite: { 
            '^/api': ' '
        }
      }
    },
    /**
     * 设置 dev服务器端口号
     * @type {Number} 默认9000
     */
    port: 9100,

    /**
     * 启用页面自动刷新
     * @type {Boolean} 默认false
     */
    livereload: true,

    /**
     * dev服务器启动自动打开页面
     * @type {Boolean} 默认false
     */
    autoopen: true
  },

  build:{
    /**
     * 打包前删除打包目录
     * @type {Boolean} 默认true
     */
    clean: false,
    /**
     * 导出HTML文件
     * @type {Boolean} 默认true
     */
    outHtml: true,
    /**
     * 启用HTML压缩
     * @type {Boolean} 默认false
     */
    openMinify: false,
    /**
     * 项目目录
     * @type {String} 默认根目录无需填写
     */
    dir:'',
    /**
     * 设置打包目录名称
     * @type {String} 默认dist
     */
    output:'dist',
    /**
     * 图片资源的发布路径
     * @type {String} 默认 ../
     */
    publicPath: '../'
  }
}
```

## router.js

可在 `router.js` 中对项目路由进一步配置，来达到同步线上场景的访问路径。

配置后实时生效，无需重启。

默认所有页面的可以直接通过 `http://localhost:9100/[name].html ` 路径访问。

```javascript
module.exports  =  {
  /**
   * key : value
   * key 支持正则匹配
   * value 可省略 .html后缀
   */
  '/':'index'
}
```