/*
* @title: 下载项目模版
*/
const path = require('path')
const exists = require('fs').existsSync
const ora = require('ora')
const home = require('user-home')
const package = require('../../package')
const rm = require('rimraf').sync
const dl = require('download-git-repo')
const async = require('async')
const ms = require('metalsmith')
const inquirer = require('inquirer')

const TEMPLATE = 'ssmNydia/mpd-cli-template#master'
const downloadDir = path.resolve(home, '.mpd-cli-template')
const templateDir = 'template'

process.on('unhandledRejection', (reason, p) => {
  console.error(reason)
})

function hasTemplate() {
  return exists(downloadDir)
}

/**
 * 从github下载模版并渲染到项目
 * @param  {boolean} ispage 是否是页面
 * @param  {string} name   页面或组件名称 若name为空，则渲染整个项目
 * @param {Function}  done      回调函数
 */
function download(dir, name, ispage, done) {
  let tmp = downloadDir
  let template = TEMPLATE

  const spinner = ora('下载模版中')
  spinner.start()

  // 清空旧的临时目录
  if(exists(tmp)){
    rm(tmp)
  }

  dl(template, tmp, {clone: false}, err => {
    spinner.stop()
    if (err) {
      cli.error('下载失败: ' + err.message.trim())
      return
    }

    generate(dir, name, ispage, done)
  })
}

function generate(dir, name, ispage, done) {
  let tmp = downloadDir
  const metalsmith = ms(path.join(tmp, dir))
  let tmpPrompt = require(tmp+'/meta.js').init
  // console.log('tmpPrompt', tmpPrompt)
  metalsmith
    .use(_ask(tmpPrompt))
    .use(_renderTmpt())
    .clean(false)
    .source('.')
    .build(err => {
      done(err, metalsmith.metadata())
    })

  function _ask(templatePrompts) {
    return (files, metalsmith, done) => {
      const nameArr = name.split('/')
      metalsmith.metadata().subName = nameArr[nameArr.length-1]
     
      if(name!==''){
        // name不为空，是添加页面或组件
        metalsmith.metadata().author = require(path.resolve('package.json')).author
        if(ispage){
          metalsmith.metadata().pagename = name
          metalsmith.destination(path.resolve('./pages', name))
        }else{
          metalsmith.metadata().modulename = name
          metalsmith.destination(path.resolve('./components', name))
        }
        // 读取项目名称，用于渲染 README.md 的脚本地址
        let siteName = process.cwd().split(path.sep).pop()
        metalsmith.metadata().name = siteName

        return done()
      }

      inquirer.prompt(templatePrompts).then(answers => {
        Object.keys(answers).forEach(k => {
          metalsmith.metadata()[k] = answers[k]
        })
        metalsmith.destination(path.resolve('./', answers.name))
        done()
      }).catch(done)
    }
  }

  function _renderTmpt() {
    return (files, metalsmith, done) => {
      let keys = Object.keys(files)
      async.each(keys, run, done)

      function run (file, done) {
        // console.log('file', file)
        let str = files[file].contents.toString()
        // do not attempt to render files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return done()
        }

        let res
        try {
          let data = metalsmith.metadata()
          if (file === 'package.json') {
            data.mpdvs = package.version
          }
          if (file.indexOf('pages') > -1) {
            data.pagename = file.split('/')[1]
          }
          if (file.indexOf('components') > -1) {
            data.modulename = file.split('/')[1]
          }
          res = render(str, data)
        } catch (err) {
          return done(err)
        }

        files[file].contents = Buffer.from(res)
        done()
      }
    }
  }
}

const etpl = require('etpl')
const engine = new etpl.Engine({
  commandOpen: '{%',
  commandClose: '%}',
  variableOpen: '{{',
  variableClose: '}}'
})

function render(template, data) {
  const renderer = engine.compile(template)
  return renderer(data)
}

function _setprompts(opts, key, val) {
  const prompts = opts.prompts || (opts.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    }
  } else {
    prompts[key].default = val
  }
}


module.exports = {
  hasTemplate,
  download,
  generate
}