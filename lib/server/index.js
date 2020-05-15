/*
* 搭建http服务
*/
const fs = require('fs')
const path = require('path')
const cli = require('../cli')
const chokidar = require('chokidar')

const Koa = require('koa')
const Router = require('koa-router')
const Static = require('koa-static')
// const Bodyparser = require('koa-bodyparser')
const proxy = require('koa-server-http-proxy')

/* 本地https start */
const https = require('https')
const enforceHttps = require('koa-sslify').default
/* end */

/* 检查端口是否冲突 */
const checkport = require('../util/port')

/* 设置路由 */
const setRouter = require('./router')

/* 中间件 */
const webpackDev = require('./middleware/webpack-dev')
const html = require('./middleware/html')
const route = require('./middleware/route')
const list = require('./middleware/list')

module.exports = class Server {
  constructor (options){
    this.options = options

    this.app = new Koa()
    this.router = new Router()
  }

  setSsl () {
    this.$data.ssl = {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/ssl-nos.key'), 'utf8'),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/ssl.pem'), 'utf8')
    }
  }

  checkRouter () {
    const ROUTE_WHITE_LIST = [ '/', '/c' ]
    Object.keys(this.options.routers).forEach(k => {
      if (ROUTE_WHITE_LIST.includes(k)) {
        cli.warn(`您配置的路由[${k}]与路由保留名单冲突了，请更改您的路由配置，否则访问该路由无法获取正确的页面内容。`)
      }
    })
  }

  getRouters () {
    let routerPath = path.resolve(process.cwd(), this.options.dir, 'router.js')
    this.options.routers = require(routerPath)
    
    this.checkRouter()
    if(this.options.livereload){
      let watcher = chokidar.watch(routerPath)
      watcher.on('change', filePath => {
        console.log(' *** 路由已更新 *** ')
        let normalizedPath = path.normalize(filePath)
        require.cache[normalizedPath] = null;
        this.options.routers = require(filePath)
        this.checkRouter()
      })
    }
  }

  async run () {
    this.getRouters()

    if(this.options.openProxy){
      Object.keys(this.options.proxy).forEach(p => {
        this.app.use(proxy(p, this.options.proxy[p]))
      })
    }

    if (this.options.livereload) {
      // 开启hotClient时取消了livereload对样式变化的监听
      // 但由于检测eslint，导致刷新过慢，故还原livereload对样式的监听
      await checkport(this.options.liveport)
        .then((port) => {
          this.options.liveport = port
          const lrs = {
            extraExts: ['scss', 'less', 'css'], // 要监听的文件类型
            delay: 500,
            port
          }

          const lrserver = require('livereload').createServer(lrs)

          lrserver.watch([
            path.resolve(this.options.dir, 'components'),
            path.resolve(this.options.dir, 'common'),
            path.resolve(this.options.dir, 'pages')
          ])
        })
    }

    const webpackMiddlewares = await webpackDev(this.options)
    const htmlMiddlewares = await html(this.options)
    const routeMiddlewares = await route(this.options)
    const middleware = routeMiddlewares.concat(webpackMiddlewares)

    const listMiddlewares = await list(this.options)

    // 兼容旧版本资源使用
    this.router.get('/assets/*/*.*', Static(this.options.dir))

    // 静态特殊路由
    this.router.get('/c', ...listMiddlewares)
    this.router.get('/c/*', ...htmlMiddlewares)
    // 基础路由
    this.router.get('/:pagename.html', ...routeMiddlewares)
    this.router.get('/:pagename', ...routeMiddlewares)
    // 自定义路由
    this.router = setRouter(this.router, middleware)
    
    this.app.use(Static(this.options.dir + '/assets/'))
      // .use(Bodyparser())
    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
    this.app.listen(this.options.port)
  }
}