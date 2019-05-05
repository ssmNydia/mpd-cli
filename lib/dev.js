/*
* @Author: shl
* @title: 
* @Date:   2019-04-23 14:35:53
* @Last Modified by:   shl
* @Last Modified time: 2019-05-05 13:38:35
*/
const path = require('path')
const open = require('open')
const Server  = require('./server')
const autoRouter = require('./server/router')
const cli = require('./cli')

const chalk = cli.chalk

process.on('unhandledRejection', (reason, p) => {
  cli.error(reason)
})

module.exports = async options => {
  options.dir = path.resolve(process.cwd(), options.dir || '')
  options.port = options.port || 9100
  options.livereload = options.livereload || false
  options.openProxy = options.openProxy || false
  options.env = 'development'

  process.env.NODE_ENV = options.env

  if (options.static) {
    options.static = options.static.replace(/\/$/, '').replace(/:\d+/, '') + ':' + options.port
  } else {
    options.static = 'http://127.0.0.1:' + options.port
  }

  const server = new Server(options)
  const autorouter = new autoRouter(server, options)
  autorouter.init()

  try {
    await server.run()

    console.log()
    console.log()
    cli.info(`服务启动成功，正在监听 ${options.static}`)
    console.log()
    console.log(chalk.yellow('页面开发:'))
    console.log(`页面放在 /pages/{页面名} 目录下，可通过 ${chalk.green(options.static + '{页面名}.html')} 进行预览。`)
    console.log(`或是 按照路由配置文件 router.js 的路由进行预览`)
    console.log()
    console.log(chalk.yellow('组件开发:'))
    console.log(`组件示例放在 /components/{组件名} 目录下，可通过 ${chalk.green(options.static + '/components/{组件名}/index.html')} 进行预览。`)
    console.log(`开发阶段下组件编译产物 URL 为 ${chalk.green(options.static + '/{组件名}/{组件名}.js')} ，可在 HTML 页面直接引入进行调试。`)
    console.log()
    console.log()

    let autoopen = options.autoopen

    if (autoopen) {
      if (/^\//.test(autoopen)) {
        autoopen = `http://127.0.0.1:${server.port}${autoopen}`
      }else{
        autoopen = `http://127.0.0.1:${server.port}`
      }

      cli.info(`正在打开网页 ${autoopen}`)
      open(autoopen)
    }
  } catch (e) {
    cli.error(e, '服务器启动失败')
  }
}