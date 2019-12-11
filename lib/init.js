const cli = require('./cli')
const fs = require('fs-extra')
const path = require('path')
const {download} = require('./util/download')
const { globPify } = require('./util')

module.exports = function() {
 download('template','', false, async (err, ans) => {
  if(err){
      cli.error(`项目初始化失败：${err.message.trim()}`)
      return
    }
    console.log('ans', ans)
    await repDefault('index', 'pages', ans.name)
    await repDefault('demo', 'components', ans.name)
    cli.info(`mpd项目创建成功!`)
 })
}

async function repDefault(name, dirname, projectname, isM = false) {
  let files = await globPify('**/*.*', {
    cwd: path.resolve(projectname, dirname, name),
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
}