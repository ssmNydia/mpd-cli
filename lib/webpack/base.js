const path = require('path')
const glob = require('glob')
const config = require('./config')

module.exports = class Base {
  constructor(options){
    this.options = options

    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })

    this.outputDir = options.output || path.resolve('dist')
    // this.packageJsonPathname = path.resolve(this.dir, 'package.json')
    this.componentDir = path.resolve(this.dir,'components')
    this.pageDir = path.resolve(this.dir,'pages')
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

  async getComponentEntries () {
    let glbOpt = {
      cwd: this.componentDir,
      root: this.componentDir
    }
    let components = await this.globFn('*/*.js', glbOpt)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    let entries = components.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      ent[`${basename}/${basename}`] = [path.resolve(this.componentDir, pathname)]
      return ent
    }, {})

    return entries
  }

  async getPageEntries () {
    let glbOpt = {
      cwd: this.pageDir,
      root: this.pageDir
    }
    let pages = await this.globFn('*/*.js', glbOpt)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    if (!pages.length) {
      console.error(`在该路径下找不到 入口文件，请检查路径是否规范：\n${this.pageDir}`)
      // 在 dev 模式下 throw Error 不会导致中断也不会显示错误，因此需要 process.exit(1) 强制中断
      process.exit(1)
    }

    let entries = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      ent[`${basename}`] = [path.resolve(this.pageDir, pathname)]
      return ent
    }, {})

    return entries
  }

  async getEntries () {
    let components = {}
    let pages = await this.getPageEntries()
    let arr = await this.getComponentEntries()
    let alias = {}
    if(process.env.NODE_ENV==='development'){
      components = arr    
    }

    let all = Object.assign({}, pages, components)

    Object.keys(arr).forEach(key => {
      let name = key.split('/')
      alias[name[0]] = arr[key][0]
    })

    return { entries: all, pages, components: alias }
  }

  async initConfig () {
    let obj = await this.getEntries()
    let entries = obj.entries
    let entryPages = obj.pages
    let alias = obj.components

    alias = Object.assign({'@': path.resolve(this.dir, 'common'), 'webpack-hot-client/client': require.resolve('webpack-hot-client/client')}, alias)

    let options = Object.assign(
      {
        entry: entries,
        outputPath: this.outputDir,
        alias: alias,
        entryPages: entryPages,
        context: this.dir+'/common/'
      },
      this.options
    )

    this.config = config(options)
  }
}