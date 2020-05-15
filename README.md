# mpd-cli
一个基于webpack的多页面开发脚手架。

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)


## 安装
请确认系统环境符合以下标准：

v1.1.3以下版本： Node.js 8.x+, npm 5.8.0+；

v1.1.3+  版本需： Node.js 10.19.0+, npm 6.13.4+

``` bash
$ npm i -g mpd-cli
```

安装完成后，可以在命令行中运行 `mpd` 命令，看看是否展示出一份可用命令的帮助信息，来验证它是否安装成功。

## 使用

### 创建项目

运行 `mpd init`，按提示完成创建；

``` bash
$ mpd init
$ cd 刚才填写的项目名称

# v1.0.13+ 无需再运行安装命令
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

# 使用 -f 可以强制覆盖同名页面，注意覆盖后，原同名文件的内容都将丢失。请谨慎使用。
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

## 功能

✅ css 预处理器支持 scss (未来2.0beta版会取消对less的支持，请直接使用scss)

✅ es6 -> es5

✅ eslint 遵循规则 standard

✅ stylelint  遵循规则 standard



## 别名alias

| 别名   | 对应目录          |
| ------ | ----------------- |
| @      | common            |
| 组件名 | components/组件名 |

创建的组件会实时更新到alias，无需重启即可直接引用。



## 项目目录介绍

请勿在项目的开发目录内随意添加目录

```
|--assets 静态资源目录（iconfont目录请放在此）
|--common 公共目录 
|--components 组件目录
|--pages 页面目录
```



## 引用

请使用 `import`取代`require`来引入资源。

```javascript
// common 目录内的js引用
import util from '@/util'

// 组件demo 的引用
import 'demo'

// 请注意引用位置：
// 示例：index.js 内
import '@/common'
// 请在 页面的scss文件前引用 组件
import 'demo'
import './index.scss'
// 请在 页面scss文件后引用公共目录的文件
import util from '@/util'

```



## 图片资源的引用

假设config内配置的publicPath 的 source 和 img 的值都为：http://img.dev.cn



### 1、“/” 指代 “assets”文件夹，仅HTML内的IMG标签可用

示例：

```html
<!-- v1.0.10+ 皆支持该用法 -->
<!-- 以前旧版本中使用 /assets/images 的需要及时更换成 / ；未来2.0beta版本将不在支持该写法 -->
<!-- 根据调试服务器静态资源配置引用资源 -->
<img src="/images/demo.png">

<!-- 打包编译后： -->
<img src="http://img.dev.cn/images/demo.png">
```

### 2、按文件的真实路径引用

#### 方法1：require

```
${require('')}
```

* HTML

```html
<!-- 内联样式里的图片，注意用require的方式引用图片路径时，路径需按照文件真实路径填写 -->
<div class="img-box" style="background-image:url(${require(`../../assets/images/img_m.png`)});"></div>

<!-- 打包编译后： -->
<div class="img-box" style="background-image: url(http://img.dev.cn/images/img_m.png);"></div>
```

* JS

```javascript
/* 按文件真实路径来引用图片资源 */
const htm = `<img src="${require('../../assets/images/demo.png')}" />`
```



#### 方法2: 直接引用

* CSS

```scss
body {
  background: url('../../assets/images/demo.png') no-repeat;
}
```





## mpd.config.js

该项目的mpd-cli配置。

**该配置信息改动后，需要重新运行调试服务器才可生效。**

```javascript
module.exports = {
  /**
   * 第三方库引入
   * @type {Array}
   */
  plugins:{
    /**
     * 所有页面都引入的库
     * 引入的路径若不是以http开头，则在打包时会自动为其添加 publichPath.source 的前缀。
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
     * @type {Number} 默认9100
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
     * 注意填写的路径末尾避免使用 '/'
     * @type {Object} 默认 为空
     */
    publicPath: {
        source: '',
        img: ''
    }
  }
}
```

## router.js

router.js配置的路由仅对本地调试服务器生效，不影响打包编译代码。该功能是为了方便保持与线上场景的访问路径一致，避免上线前重新更改路径。

可在 `router.js` 中对项目路由进一步配置，来达到同步线上场景的访问路径。

>  **router.js内容变更后实时生效，无需重启**

默认所有页面的可以直接通过 `http://localhost:9100/[name].html `  和 ``` http://localhost:9100/[name]```路径访问。

**允许携带query参数**

**配置路由时，应注意避免配置 “/” 和 “/c” 两个路径**

```javascript
module.exports  =  {
  /**
   * key : value
   * key 写法参考：/ ， /user ， /users/:id ， /users_:id ，/users_p_:id
   * 变量（:id）仅可出现一次，遇到需要多个变量的情况，请选择写死多余变量来实现
   * 多个变量需使用/隔断
   * value pages目录内的页面名称，省略 .html后缀
   */
  'p': 'page'
}
```

