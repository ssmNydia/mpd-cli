const fs = require('fs-extra')
const path = require('path')
const cli = require('./cli')
const {download} = require('./util/download')
const {globPify,readFile} = require('./util')

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
    if(config.options.page){
      console.log(config.name)
      replaceName('pages',config.options.args[1],config.options.args[0])
    }else{
      iserror++
    }
    if(config.options.component){
      replaceName('components',config.options.args[1],config.options.args[0])
    }else{
      iserror++
    }
    if(iserror===2){
      cli.error('缺少类型指令，请按照 `mpd add [-p|-c] -r 旧名称 新名称` 的格式重新输入')
    }else{
      cli.info(`${typeName}重命名为: ${config.name} 成功!`)
    }
    return
  }
  
  if ((fs.existsSync(path.resolve('components', config.name))||fs.existsSync(path.resolve('pages', config.name))) && !config.options.force) {
    cli.warn(typeName +' '+ config.name + ' 已存在，您可以使用 -f 参数强制覆盖')
    return
  }

  let isPage = config.options.page
  let dir = 'template/components/demo'
  if(isPage){
    dir = 'template/pages/index'
  }
  download(dir,config.name, isPage, async err => {
    if(err){
      cli.error(`添加${typeName}失败：${err.message.trim()}`)
      return
    }
    if(isPage){
      await repPageName(config.name)
    }else{
      await repCompName(config.name)
    }
    cli.info(`添加${typeName}: ${config.name} 成功!`)
  })
}

const replaceName = async (dir, oldname, newname) => {
  let files = await globPify('**/*.*', {
    cwd: path.resolve(dir, oldname),
    realpath: true
  })
  let reg = new RegExp(`${oldname}\.(js|less|html)$`,'i')
  await Promise.all(
    files.filter(filename => reg)
      .map(async filename => {
        fs.renameSync(filename, filename.replace(reg, newname + '.$1'))
      })
  )
  fs.renameSync(path.resolve(dir, oldname),path.resolve(dir, newname))
}

const repPageName = async (name) => {
  let files = await globPify('**/*.*', {
    cwd: path.resolve('pages', name),
    realpath: true
  })
  await Promise.all(files.map(async filename => {
    let content = fs.readFileSync(filename, 'utf-8')
    content = content.replace(/\{n\}/g, name).replace(/index/g, name)
    fs.writeFileSync(filename, content, 'utf-8')
  }))
  await Promise.all(
    files.filter(filename => /index\.(js|less|html)$/)
      .map(async filename => {
        fs.renameSync(filename, filename.replace(/index\.(js|less|html)/, name + '.$1'))
      })
  )
}

const repCompName = async (name) => {
  let files = await globPify('**/*.*', {
    cwd: path.resolve('components', name),
    realpath: true
  })

  await Promise.all(files.map(async filename => {
    let content = fs.readFileSync(filename, 'utf-8')
    content = content.replace(/\{n\}/g, name).replace(/demo/g, name)
    fs.writeFileSync(filename, content, 'utf-8')
  }))
  await Promise.all(
    files.filter(filename => /demo\.(js)$/)
      .map(async filename => {
        fs.renameSync(filename, filename.replace(/demo\.(js)/, name + '.$1'))
      })
  )
}