
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
    let options = Object.assign({app: this.app}, this.options)

    let middleware = await script(options)
    let rdmid = await render(options)
    let dirmid = await Dir(this.dir)

    this.router
      // .get('/assets/*/*.*', Static(this.dir))
      .get('/c', ...dirmid)
      .get('/c/*/index.html', ...rdmid)
      // .get('/*/*.js', ...scriptmid, Static(this.dir))
      .get('*', ...middleware)

    if(this.openProxy){
      let app = this.app
      Object.keys(this.proxy).forEach(p => {
        this.app.use(proxy(p, this.proxy[p]))
      })
    }
    this.app
      // .use(middleware)
      .use(Static(this.dir))
      // .use(Static(this.dir+'/assets/'))
      .use(async (ctx, next) => {
        if (!/\.js|\.css|\.json|\.woff2|\.png|\.jpg/.test(ctx.request.url)){
          cli.info('访问：'+ctx.request.url)
        }
        ctx.webpackConfig = options.webpackConfig
        await next()
      })
      .use(Bodyparser())
      .use(this.router.routes())
      .listen(this.port)

    if (this.livereload) {
      // 开启hotClient时取消了livereload对样式变化的监听
      // 但由于检测eslint，导致刷新过慢，故还原livereload对样式的监听
      const lrserver = require('livereload').createServer({
        extraExts: ['vue', 'scss', 'less', 'html'], // 要监听的文件类型
        delay: 500,
        port: this.liveport
      })

      lrserver.watch([
        path.resolve(this.dir, 'components'),
        path.resolve(this.dir, 'common'),
        path.resolve(this.dir, 'pages')
      ])
    }
  }
}