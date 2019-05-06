/*
* @title: 下载项目模版
*/
const path = require('path')
const exists = require('fs').existsSync
const ora = require('ora')
const home = require('user-home')
const rm = require('rimraf').sync
const dl = require('download-git-repo')
const async = require('async')
const ms = require('metalsmith')
const inquirer = require('inquirer')

const TEMPLATE = 'ssmNydia/mpd-cli-template#develop'
const downloadDir = path.resolve(home, '.mpd-cli-template')
const templateDir = 'template'

/**
 * 从github下载模版并渲染到项目
 * @param  {boolean} ispage 是否是页面
 * @param  {string} name   页面或组件名称 若name为空，则渲染整个项目
 * @param {Function}  done      回调函数
 */
function download(dir, name,ispage,done) {
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

  metalsmith
    .use(_ask(tmpPrompt))
    .use(_renderTmpt())
    .clean(false)
    .source('.')
    .build(err => {
      done(err)
    })

  function _ask(templatePrompts) {
    return (files, metalsmith, done) => {
      metalsmith.metadata().subName = name

      if(name!==''){
        // name不为空，则不走ask流程
        if(ispage){
          metalsmith.destination(path.resolve('./pages',name))
        }else{
          metalsmith.destination(path.resolve('./components',name))
        }
        // 读取项目名称，用于渲染 README.md 的脚本地址
        let siteName = process.cwd().split(path.sep).pop()
        metalsmith.metadata().name = siteName

        return done()
      }

      async.eachSeries(Object.keys(templatePrompts), run, () => {
        metalsmith.destination(path.resolve('./', metalsmith.metadata().name))
        done()
      })

      function run(key, done) {
        let prompt = templatePrompts[key]

        inquirer.prompt({
          'type': prompt.type,
          'name': key,
          'message': prompt.message || prompt.label || key,
          'default': prompt.default,
          'validate': prompt.validate || (() => true)
        }).then(answers => {
          if (typeof answers[key] === 'string') {
            metalsmith.metadata()[key] = answers[key].replace(/"/g, '\\"')
          } else {
            metalsmith.metadata()[key] = answers[key]
          }
          done()
        }).catch(done)
      }
    }
  }

  function _renderTmpt() {
    return (files, metalsmith, done) => {
      let keys = Object.keys(files)
      async.each(keys, run, done)

      function run (file, done) {
        let str = files[file].contents.toString()

        // do not attempt to render files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return done()
        }

        let res
        try {
          res = render(str, metalsmith.metadata())
        } catch (err) {
          return done(err)
        }

        files[file].contents = Buffer.from(res)
        done()
      }
    }
  }
}

function downloadPluginJs(name,version) {
  
}

function downloadPluginJsUrl(url) {
  download('direct:'+url, path.resolve('./assets','lib'), err => {

  })
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
  download
}