/*
* @Author: shl
* @title: 打包编译后本地启动测试服查验
* @Date:   2019-12-24 10:32:41
* @Last Modified by:   shl
* @Last Modified time: 2020-03-09 17:06:47
*/
const Koa = require('koa')
const Router = require('koa-router')
const Static = require('koa-static')
const Bodyparser = require('koa-bodyparser')
const proxy = require('koa-server-http-proxy')
const path = require('path')
const cli = require('./cli')
const checkport = require('./util/port')
/* 本地https */
const https = require('https')
const enforceHttps = require('koa-sslify').default
const fs = require('fs')
const open = require('open')
const os = require('os')

const chalk = cli.chalk

module.exports = async options => {
  options.port = 9000
  console.log('options.output', options.output)
  options.outputPath = path.resolve(process.cwd(), options.output || 'dist')
  const server = {}
  server.app = new Koa()
  server.router = new Router()
  
  const sslopt = {
    key: fs.readFileSync(path.resolve(__dirname, './server/ssl/ssl-nos.key'), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, './server/ssl/ssl.pem'), 'utf8')
  }

  if (options.static) {
    options.static = options.static.replace(/\/$/, '').replace(/:\d+/, '') + ':' + options.port
  } else {
    options.localip = cli.getLocalIP(os.networkInterfaces())
  }
  

  server.app
    .use(Static(options.outputPath))
    .use(Bodyparser())
    .use(server.router.routes())
    .use(server.router.allowedMethods())
  try {
    await checkport(options.port)
      .then((port) => {
        console.log('port', port)
        options.port = port
        if (options.openHttps) {
          https.createServer(sslopt, server.app.callback()).listen(port, () => {})
        } else {
          server.app.listen(port)
        }
        options.static = `http${options.openHttps?'s':''}://${options.localip}:${options.port}`
        let autoopen = options.autoopen

        if (autoopen) {
          if (/^\//.test(autoopen)) {
            autoopen = `${options.static}${autoopen}`
          }else{
            autoopen = `${options.static}`
          }
          open(autoopen)
        }
        console.log()
        console.log(`  测试服务器启动:`)
        console.log(`  - Local:   ${chalk.cyan(`http${options.openHttps?'s':''}://localhost:${options.port}`)}`)
        console.log(`  - Network: ${chalk.cyan(options.static)}`)
        console.log()
      })
  } catch (err) {
    console.error(err)
  }
}