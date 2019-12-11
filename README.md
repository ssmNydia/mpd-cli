# mpd-cli
多页面开发脚手架

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## 安装
请确认系统环境符合以下标准：Node.js 8.x+, npm 5.8.0+

``` bash
$ npm i -g mpd-cli
```

安装完成后，可以在命令行中运行 `mpd` 命令，看看是否展示出一份可用命令的帮助信息，来验证它是否安装成功。

## 使用说明

### 创建项目

运行 `mpd init`，按提示完成创建；

``` bash
$ mpd init
$ cd 刚才填写的项目名称
# v1.0.13+ 无需再运行该命令
$ npm i
```

### 新增页面或组件

``` bash
# 使用 -p 添加名为 demo的页面
$ mpd add -p demo

# 使用 -p 添加名为 demo的M版页面
$ mpd add -pm demo

# 使用 -c 添加名为 test的组件
$ mpd add -c test

# 使用 -r 可以对已有页面进行重命名 将index 改为 demo
$ mpd add -pr index demo

# 使用 -f 可以强制覆盖同名页面
$ mpd add -pf index

# 使用 -d 下载最新模版添加页面
$ mpd add -pd index
```

### 启动调试服务器，在项目根目录运行

``` bash
$ mpd dev
```

### 构建打包项目，在项目根目录运行

``` bash
$ mpd build
```

当出现编译失败时，请根据错误提示，修改相应的文件。当代码符合eslint的规范时，即可成功编译。

# 别名alias

| 别名   | 对应目录          |
| ------ | ----------------- |
| @      | common            |
| 组件名 | components/组件名 |

创建的组件会实时更新到alias，无需重启即可直接引用。

# 引用

请使用 `import`取代`require`来引入资源。

```javascript
// common 目录内的js引用
import util from '@/util'

// 组件demo 的引用
import 'demo'
```

## 图片资源

### Html

在HTML页面内，打包编译时，仅打包使用以下形式引用图片的图片资源：

```html
<!-- 根据调试服务器静态资源配置引用资源 -->
<img src="/images/demo.png">

<!-- 打包编译后： -->
<img src="http://img.dev.cn/images/demo.png">
```

### Css

在样式文件(scss)内，图片应按文件真实路径来引用资源。



### JS

```javascript
/* 按文件真实路径来引用图片资源 */
const htm = `<img src="${require('../../assets/images/demo.png')}" />`
```





## mpd.config.js

项目的配置。

该配置信息改动后，需要重新运行调试服务器才可生效。

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
     * 仅global内支持 字符和对象两种类型
     */
    global:[
        /* 直接填入需要引入库的路径 */
        'https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js',
        /* 
        * 或填入对象，可配置:
        * ishead放置在头部 
        * islast 放置在所有资源的末尾 
        * url为引入库路径 
            e.g:
            { ishead: true, url: 'https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js' },
        */
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
  * dev 和 build 拥有一样的可配置项有:
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
     * 启用https
     * @type {String} 默认false
     */
    openHttps: true,
    /**
     * 是否开启检查模式
     * @type {Boolean} 默认false
     */
    openLint: false,
    /**
     * 设置 dev服务器端口号 多开时需要手动修改避免重复
     * @type {Number} 默认9000
     */
    port: 9100,
    
		/**
     * 自动刷新监听端口 多开时需要手动修改避免重复
     * @type {Number}
     */
    liveport: 35729,

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
     * HTML页面是否设置favicon
     * @type {Boolean} 默认false
     */
    favicon: false,
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
     * @type {Object} 默认 ../
     */
    publicPath: {
        source: '../',
        img: '../'
    }
  }
}
```

## router.js

router.js配置的路由仅对本地调试服务器生效，不影响打包编译代码。

可在 `router.js` 中对项目路由进一步配置，来达到同步线上场景的访问路径。

>  **新增实时生效，无需重启；修改需要重启生效。**

默认所有页面的可以直接通过 `http://localhost:9100/[name].html ` 路径访问。

```javascript
module.exports  =  {
  /**
   * key : value
   * key 写法参考：/ ， /user ， /users/:id ， /users_:id ，/users_p_:id一个可以内变量（:id）仅可出现一次，遇到需要多个变量的情况，请选择写死多余变量来实现
   * 冒号后即视为变量字段名称 除非使用/隔断
   * value pages目录内的页面名称，可省略 .html后缀
   */
  '/':'index'
}
```

