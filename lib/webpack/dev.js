const webpack = require('webpack')
const koaWebpack = require('koa-webpack')
const Base = require('./base')
const util = require('../util')

process.on('unhandledRejection', (reason, p) => {
  console.error(' ? === 错误： ', reason)
})

module.exports = class Dev extends Base {
  constructor (options) {
    super(options)

    this.loaded = new Promise(resolve => {
      this.resolver = resolve
    })

    this.initDev()
    this.initWatch()
  }

  async dev (ctx, next) {
    // console.log('dev', ctx.request.url)
    if (this.isOnInited) {
      ctx.body = '编译中...'
    } else {
      await this.middleware(ctx, next)
    }
  }
  
  // dev (ctx, next) {
  //   // console.log('dev', ctx.request.url)
  //   return this.middleware(ctx, next)
  // }

  async initDev () {
    if (this.isOnInited) {
      return
    }

    this.isOnInited = true

    if (this.middleware) {
      // 关闭 devmiddleware 和 hotclient
      this.middleware.close()
      // this.middleware.devMiddleware.close()
    }

    await this.initConfig()

    console.log('正在启动编译服务...')

    this.compiler = webpack(this.config)
    this.compiler.hooks.done.tap('Dev', () => {
      this.resolver()
    })
    this.compiler.hooks.done.tap('HtmlWebpackPlugin', (compilation, callback) => {
      console.log(' HtmlWebpackPlugin done ')
      this.compilation = compilation.compilation
    })

    // 开启hotClient，由于检测eslint，导致刷新过慢，故暂时取消
    // this.middleware = await koaWebpack({
    //   compiler: this.compiler,
    //   devMiddleware: {
    //     publicPath: '/',
    //     stats: 'errors-only'
    //   },
    //   hotClient: {
    //     allEntries: true,
    //     autoConfigure: true
    //   }
    // })
    this.middleware = await koaWebpack({
      compiler: this.compiler,
      devMiddleware: {
        contentBase: this.outputPath,
        publicPath: '/',
        stats: 'errors-only'
      },
      hotClient: false
    })

    this.isOnInited = false
  }

  async initWatch () {
    // 监听组件、页面变化
    const chokidar = require('chokidar')
    let compWatcher = chokidar.watch(this.componentDir)
    let pageWatcher = chokidar.watch(this.pageDir)
    let cb = async pathname => {
      if (this.isOnInited) {
        return
      }
      console.log('pathname', pathname)
      if (!util.isNeedCompile(this.dir, pathname)) {
        return
      }

      try {
        await this.initDev()
      } catch (e) {
        console.error('init error')
        console.error(e)
      }
    }

    compWatcher.on('ready', () => {
      compWatcher.on('add', cb).on('unlink', cb)
    })

    pageWatcher.on('ready', () => {
      pageWatcher.on('add', cb).on('unlink', cb)
    })
  }
}