/*
* @Author: shl
* @title: 
* @Date:   2019-04-23 14:36:05
* @Last Modified by:   shl
* @Last Modified time: 2019-05-05 13:32:18
*/
const Builder = require('./webpack/build')
const fs = require('fs-extra')
const path = require('path')
const cli = require('./cli')
const CWD = process.cwd()

module.exports = async function (options) {
  options.outputPath = path.resolve(CWD, options.output || 'dist')
  options.dir = path.resolve(CWD, options.dir || '')
  options.static = options.static || '/'
  options.env = options.env || 'production'
  options.publicPath = options.publicPath || ''
  options.publicUrl = options.publicUrl || ''

  process.env.NODE_ENV = options.env

  const builder = new Builder(options)

  try {
    if (options.clean) {
      await fs.remove(options.output)
    }
    cli.info('开始编译...')
    await builder.build()

    cli.info('编译成功！')
  } catch (e) {
    cli.error('编译失败')
    if (Array.isArray(e)) {
      e.forEach(err => {
        cli.error(err)
        cli.info(' ')
      })
    } else {
      cli.error(e)
    }

    throw e
  }
}