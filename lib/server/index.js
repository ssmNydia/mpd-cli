
const Koa = require('koa')
const Router = require('koa-router')
const Static = require('koa-static')
const cors = require('koa2-cors')
const path = require('path')
const cli = require('../cli')
const script = require('./script')
const render = require('./render')

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

    let [scriptmid, rdmid] = await Promise.all([
      script(options),
      render(options)])

    this.router
      .get('/assets/*/*.*', Static(this.dir))
      .get('/*/*.html', ...rdmid)
      // .get('/*/*.js', ...scriptmid, Static(this.dir))
      .get('*', ...scriptmid)

    if(this.openProxy){
      this.app.use(cors())
    }
    this.app
      .use(async (ctx, next) => {
        cli.info('访问：'+ctx.request.url)
        await next()
      })
      .use(this.router.routes())
      .listen(this.port)

    if (this.livereload) {
      const lrserver = require('livereload').createServer({
        extraExts: ['vue', 'less', 'css'],
        delay: 500
      })

      lrserver.watch([
        path.resolve(this.dir, 'components'),
        path.resolve(this.dir, 'common'),
        path.resolve(this.dir, 'pages')
      ])
    }
  }
}