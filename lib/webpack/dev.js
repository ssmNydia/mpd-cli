const webpack = require('webpack')
const middleware = require('koa-webpack')
const Base = require('./base')
const util = require('../util')

process.on('unhandledRejection', (reason, p) => {
  console.error(reason)
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
    if (this.isOnInited) {
      ctx.body = 'initing...'
    } else {
      await this.midd(ctx, next)
    }
  }

  async initDev () {
    if (this.isOnInited) {
      return
    }

    this.isOnInited = true

    if (this.midd) {
      this.midd.close()
    }

    await this.initConfig()

    console.log('正在启动编译服务...')

    this.compiler = webpack(this.config)
    this.compiler.hooks.done.tap('Dev', () => {
      this.resolver()
    })

    this.midd = await middleware({
      compiler: this.compiler,
      devMiddleware: {
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
      console.log('pathname',pathname)
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