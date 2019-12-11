const fs = require('fs-extra')
const path = require('path')
const cli = require('./cli')
const { hasTemplate, download, generate } = require('./util/download')
const { globPify, readFile } = require('./util')
const rename = require('./util/rename')

process.on('unhandledRejection', (reason, p) => {
  cli.error(reason)
})

module.exports = function(config) {
  let typeName = '页面'
  if(!config.options.page){
    typeName = '组件'
  }
  if(!config.name){
    cli.program.help()
    cli.error(`缺少${typeName}的名称，请按 ‘mpd add ${typeName==='页面'?'-p':'-c'} [名称]’ 的格式输入 `)
    return
  }
  // -r 重命名
  if(config.options.rename){
    let iserror = 0
    if (config.options.args.length < 2) {
      cli.error('缺少一个命名')
    } else {
      if(config.options.page){
        rename('pages', config.options.args[1], config.options.args[0])
      }else{
        iserror++
      }
      if(config.options.component){
        rename('components', config.options.args[1], config.options.args[0])
      }else{
        iserror++
      }
      if(iserror===2){
        cli.error('缺少类型指令，请按照 `mpd add [-p|-c] -r 旧名称 新名称` 的格式重新输入')
      }else{
        cli.info(`${typeName}重命名为: ${config.name} 成功!`)
      }
    }
    return
  }
  
  if ((fs.existsSync(path.resolve('components', config.name))||fs.existsSync(path.resolve('pages', config.name))) && !config.options.force) {
    cli.warn(typeName +' '+ config.name + ' 已存在，您可以使用 -f 参数强制覆盖')
    return
  }
  const isM = config.options.ism
  let isPage = config.options.page
  let dir = 'template/components/demo'
  if(isPage){
    dir = 'template/pages/index'
  }
  // 从github下载模版原则：
  // 初次创建项目时
  // 传入参数 -d 时
  if (!hasTemplate() || config.options.download) {
    download(dir, config.name, isPage, async err => {
      if(err){
        cli.error(`添加${typeName}失败：${err.message.trim()}`)
        return
      }
      if(isPage){
        await repPageName(config.name, isM)
      }else{
        await repCompName(config.name, isM)
      }
      cli.info(`添加${typeName}: ${config.name} 成功!`)
    })
  } else {
    generate(dir, config.name, isPage, async err => {
      if(err){
        cli.error(`添加${typeName}失败：${err.message.trim()}`)
        return
      }
      if(isPage){
        await repPageName(config.name, isM)
      }else{
        await repCompName(config.name, isM)
      }
      cli.info(`添加${typeName}: ${config.name} 成功!`)
    })
  }
}

const repPageName = async (name, isM) => {
  let dir = ''
  if (name.indexOf('/') > -1) {
    let a = name.split('/')
    a.forEach((p, i) => {
      console.log('i', i)
      if (i < a.length-1) {
        dir += p + '/'
      }
    })
    name = a[a.length-1]
  }
  let files = await globPify('**/*.*', {
    cwd: path.resolve('pages', dir, name),
    realpath: true
  })

  await Promise.all(
    files.filter(filename => /index\.html/)
    .map(async filename => {
      let content = fs.readFileSync(filename, 'utf-8')
      let meta = ''
      if (isM) {
        meta = '\n  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1.0,user-scalable=no">\n  <meta name = "format-detection" content = "telephone=no">'
      }
      content = content.replace('{meta}', meta)
      fs.writeFileSync(filename, content, 'utf-8')
    })
  )
  await Promise.all(
    files.filter(filename => /index\.(js|less|scss|html)$/)
      .map(async filename => {
        fs.renameSync(filename, filename.replace(/index\.(js|less|scss|html)/, name + '.$1'))
      })
  )
}

const repCompName = async (name) => {
  let files = await globPify('**/*.*', {
    cwd: path.resolve('components', name),
    realpath: true
  })

  await Promise.all(
    files.filter(filename => /index\.html/)
    .map(async filename => {
      let content = fs.readFileSync(filename, 'utf-8')
      let meta = ''
      if (isM) {
        meta = '\n  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1.0,user-scalable=no">\n  <meta name = "format-detection" content = "telephone=no">'
      }
      content = content.replace('{meta}', meta)
      fs.writeFileSync(filename, content, 'utf-8')
    })
  )
  await Promise.all(
    files.filter(filename => /demo\.(js)$/)
      .map(async filename => {
        fs.renameSync(filename, filename.replace(/demo\.(js)/, name + '.$1'))
      })
  )
}