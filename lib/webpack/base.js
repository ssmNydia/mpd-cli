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
    this.packageJsonPathname = path.resolve(this.dir, 'package.json')
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

  async getEntriesAlone () {
    let glbOpCop = {
      cwd: this.componentDir,
      root: this.componentDir
    }
    let glbOpPg = {
      cwd: this.pageDir,
      root: this.pageDir
    }
    let components = null
    if(process.env.NODE_ENV==='development'){
      components = await this.globFn('*/*.js', glbOpCop)
        .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))
    }
    let pages = await this.globFn('*/*.js', glbOpPg)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))
    // 获取二级入口
    let subpages = await this.globFn('*/*/*.js', glbOpPg)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    if (!pages.length) {
      console.error(`在该路径下找不到 入口文件，请检查路径是否规范：\n${this.pageDir}`)
      // 在 dev 模式下 throw Error 不会导致中断也不会显示错误，因此需要 process.exit(1) 强制中断
      process.exit(1)
    }

    let entries = {}
    if(process.env.NODE_ENV==='development'){
      entries = components.reduce((ent, pathname) => {
        let basename = path.basename(pathname, path.extname(pathname))
        ent[`${basename}/${basename}`] = [path.resolve(this.componentDir, pathname)]
        return ent
      }, {})
    }
    let entryPages = {}
    entries = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      entryPages[`${basename}`] = path.resolve(this.pageDir, pathname)
      entries[`${basename}`] = [path.resolve(this.pageDir, pathname)]
      return entries
    }, {})
    if (subpages.length !== 0) {
      entries = subpages.reduce((ent, pathname) => {
        console.log('pathname', pathname)
        let dir = pathname.split('/')[0]
        let basename = path.basename(pathname, path.extname(pathname))
        entryPages[`${dir}/${basename}`] = path.resolve(this.pageDir, pathname)
        entries[`${dir}/${basename}`] = [path.resolve(this.pageDir, pathname)]
        return entries
      }, {})
    }
    return {entries, entryPages}
  }

  async getEntriesMerge() {
    let glbOpCop = {
      cwd: this.componentDir,
      root: this.componentDir
    }
    let glbOpPg = {
      cwd: this.pageDir,
      root: this.pageDir
    }
    let components = null
    if(process.env.NODE_ENV==='development'){
      components = await this.globFn('*/*.js', glbOpCop)
        .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))
    }
    let pages = await this.globFn('*/*.js', glbOpPg)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))
    // 获取二级入口
    let subpages = await this.globFn('*/*/*.js', glbOpPg)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    if (!pages.length) {
      console.error(`在该路径下找不到 入口文件，请检查路径是否规范：\n${this.pageDir}`)
      // 在 dev 模式下 throw Error 不会导致中断也不会显示错误，因此需要 process.exit(1) 强制中断
      process.exit(1)
    }

    let entries = []
    if(process.env.NODE_ENV==='development'){
      entries = components.reduce((ent, pathname) => {
        let basename = path.basename(pathname, path.extname(pathname))
        return path.resolve(this.componentDir, pathname)
      }, {})
    }
    let entryPages = []
    entries = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      entryPages.push(path.resolve(this.pageDir, pathname))
      entries.push(path.resolve(this.pageDir, pathname))
      return entries
    }, {})
    return {entries, entryPages}
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
    let entries = null
    let entryPages = null
    if (this.options.mode === 'merge') {
      let obj = await this.getEntriesMerge()
      entries = obj.entries
      entryPages = obj.entryPages
    } else {
      let obj = await this.getEntriesAlone()
      entries = obj.entries
      entryPages = obj.entryPages
    }
    let alias = await this.getAlias()
    // 
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