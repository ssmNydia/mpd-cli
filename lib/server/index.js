
const Koa = require('koa')
const Router = require('koa-router')
const Static = require('koa-static')
const cors = require('koa-cors')
const path = require('path')
const cli = require('../cli')
const script = require('./middleware/script')

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

    let scriptmid = await script(options)

    this.router
      .get('/assets', Static(this.dir+'/assets'))
      .get('/*/*.*', Static(this.dir+'/components'))
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
      .listean(this.port)
  }
}