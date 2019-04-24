/*
* @Author: smm
* @Date:   2019-04-20 09:04:27
* @Last Modified by:   smm
* @Last Modified time: 2019-04-24 20:52:43
*/
const path = require('path')
const glob = require('glob')
const config = require('./config')
const projectPath = require('../util/path')

module.exports = class Base {
  constructor(options){
    this.options = options

    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })

    this.outputDir = options.output || path.resolve('dist')
    this.packageJsonPathname = path.resolve(this.dir, 'package.json')
    this.componentDir = projectPath.components(this.dir)
    this.pageDir = projectPath.pages(this.dir)
  }

  pify (fn) {
    return (...args) => new Promise((resolve, reject) => {
      let callback = (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      }

      fn(...args, callback)
    })
  }

  globFn (...args) {
    return this.pify(glob)(...args)
  }

  async getEntries () {
    // let glbOpCop = {
    //   cwd: this.componentDir,
    //   root: this.componentDir
    // }
    let glbOpPg = {
      cwd: this.pageDir,
      root: this.pageDir
    }

    // let components = await this.globFn('*/*.js', glbOpCop)
    //   .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))
    let pages = await this.globFn('*/*.js', glbOpPg)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    if (!pages.length) {
      console.error(`在该路径下找不到 入口文件，请检查路径是否规范：\n${this.pageDir}`)
      // 在 dev 模式下 throw Error 不会导致中断也不会显示错误，因此需要 process.exit(1) 强制中断
      process.exit(1)
    }

    let entries = {}
    // entries = components.reduce((ent, pathname) => {
    //   let basename = path.basename(pathname, path.extname(pathname))
    //   ent[`${basename}`] = path.resolve(this.componentDir, pathname)
    //   return ent
    // }, {})
    entries = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      entries[`${basename}`] = path.resolve(this.pageDir, pathname)
      return entries
    }, {})

    return entries
  }

  async getAlias () {
    let glbOpCop = {
      cwd: this.componentDir,
      root: this.componentDir
    }
    let components = await this.globFn('*/*.js', glbOpCop)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    let alias = components.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      ent[`${basename}`] = path.resolve(this.componentDir, pathname)
      return ent
    }, {})
    return alias
  }

  async initConfig () {
    let entries = await this.getEntries()
    let alias = await this.getAlias()

    alias = Object.assign({'@': path.resolve(this.dir,'common')},alias)
    let options = Object.assign(
      {
        entry: entries,
        outputPath: this.outputDir,
        alias: alias,
        context: this.dir+'/common/'
      },
      this.options
    )

    this.config = config(options)
  }
}