const Koa = require('koa')
const Router = require('koa-router')
const Static = require('koa-static')
const Bodyparser = require('koa-bodyparser')
const proxy = require('koa-server-http-proxy')
const path = require('path')
const cli = require('../cli')
const script = require('./script')
const render = require('./render')
const Dir = require('./dir')
const checkport = require('../util/port')
/* 本地https */
const https = require('https')
const enforceHttps = require('koa-sslify').default
const fs = require('fs')

module.exports = class Server {
  constructor (options){
    this.options = options
    Object.keys(options).forEach(key=>{
      this[key] = options[key]
    })

    this.app = new Koa()
    this.router = new Router()
  }

  async run(){
    const that = this
    const sslopt = {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/ssl-nos.key'), 'utf8'),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/ssl.pem'), 'utf8')
    }
    let options = Object.assign({app: this.app}, this.options)

    if (this.livereload) {
      // 开启hotClient时取消了livereload对样式变化的监听
      // 但由于检测eslint，导致刷新过慢，故还原livereload对样式的监听
      await checkport(this.liveport)
        .then((port) => {
          that.options.liveport = port
          options.liveport = port
          const lrs = {
            extraExts: ['scss', 'less', 'css'], // 要监听的文件类型
            delay: 500,
            port
          }

          const lrserver = require('livereload').createServer(lrs)

          lrserver.watch([
            path.resolve(that.dir, 'components'),
            path.resolve(that.dir, 'common'),
            path.resolve(that.dir, 'pages')
          ])
        })
    }

    let rdmid = await render(options)
    let middleware = await script(options)
    let dirmid = await Dir(this.dir)

    if (options.openHttps) {
      // 强制转换https
      this.app.use(enforceHttps())
    }

    this.router
      // .get('/assets/*/*.*', Static(this.dir))
      .get('/c', ...dirmid)
      .get('/c/*/index.html', ...rdmid)
      .get('*', ...middleware)

    options.autorouter.init()

    if(this.openProxy){
      let app = this.app
      Object.keys(this.proxy).forEach(p => {
        this.app.use(proxy(p, this.proxy[p]))
      })
    }

    this.app
      .use(Static(this.dir+'/assets/'))
      .use(async (ctx, next) => {
        if (!/\.js|\.css|\.json|\.woff2|\.png|\.jpg/.test(ctx.request.url)){
          // cli.info('访问：'+ctx.request.url)
        }
        ctx.webpackConfig = options.webpackConfig
        await next()
      })
      .use(Bodyparser())
      .use(this.router.routes())
      .use(this.router.allowedMethods())

    await checkport(options.port)
      .then((port) => {
        that.options.port = port
        options.port = port
        if (options.openHttps) {
          https.createServer(sslopt, that.app.callback()).listen(port, () => {})
        } else {
          that.app.listen(port)
        }
      })
  }
}