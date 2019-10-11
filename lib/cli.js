'use strict'
const program = require('commander')
const chalk = require('chalk')
const format = require('util').format
const request = require('request')
const semver = require('semver')

module.exports = {
  checkversion(curversion){
    return new Promise((resolve, reject) => {
      request({
        url: 'https://registry.npmjs.org/mpd-cli',
        timeout: 3000
      }, (err, res, body) => {
        if(err){
          // console.log('检查mpd-cli是否有新版本失败')
          // console.log(err)
        } else if (res.statusCode === 200){
          const v = JSON.parse(body)['dist-tags'].latest
          if(semver.lt(curversion,v)){
            console.log()
            console.log(chalk.yellow('  *** 检测到有新版本的 mpd-cli 可用 ***'))
            console.log()
            console.log('  最新版本: ' + chalk.green(v))
            console.log('  当前版本: ' + chalk.red(curversion))
            console.log()
            console.log(' 您可以使用 npm update -g mpd-cli 进行更新')
            console.log()
          }
        }
        resolve()
      })
    })
  },
  getLocalIP(interfaces) {
    let ip = '127.0.0.1'
    for(var devName in interfaces){
      var iface = interfaces[devName];
      for(var i=0;i<iface.length;i++){
        var alias = iface[i];
        if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && alias.address.indexOf('192.') > -1){
            ip = alias.address;
        }
      }
    }
    return ip
  },
  program,
  chalk,
  /**
   * 设置命令行项目解析
   *
   * @param  {Object} config 解析参数
   * @return {Array}  解析后的参数集合
   */
  setup (config) {
    if (config.name) {
      program.name(config.name)
    }

    if (config.usage) {
      program.arguments(config.usage)
    }

    if (config.options) {
      config.options.forEach(option => {
        program.option(option[0], option[1], option[2])
      })
    }

    if (config.help) {
      program.on('--help', () => {
        console.log(config.help)
      })
    }

    program.parse(process.argv)
    // 只有命令，没有设置参数，打印help
    if (program.args.length === 0 && !config.noArgs) {
      return program.help()
    }

    return program.args || []
  },

  /**
   * 打印消息
   *
   * @param {...string} args 参数
   */
  info (...args) {
    const msg = format.apply(format, args)
    console.log(chalk.green('信息'), msg)
  },

  /**
   * 打印警告
   *
   * @param {...string} args 参数
   */
  warn (...args) {
    const msg = format.apply(format, args)
    console.log(chalk.yellow('警告'), msg)
  },

  /**
   * 打印错误
   *
   * @param {...string} args 参数
   */
  error (...args) {
    console.error(chalk.red('错误'), ...args)
  },
  
  /**
   * 打印提示
   *
   * @param {...string} args 参数
   */
  tip (...args) {
     const msg = format.apply(format, args)
    console.log(chalk.gray(msg))
  }
}