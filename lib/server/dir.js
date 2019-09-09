/*
* @Author: shl
* @title: 输出组件目录页
* @Date:   2019-09-09 09:41:39
* @Last Modified by:   shl
* @Last Modified time: 2019-09-09 10:02:56
*/
const path = require('path')
const glob = require('glob')

module.exports = async function (dir) {
  return [
    async (ctx, next) => {
      let files = glob.sync('*/index.html', {
        cwd: path.resolve(dir,'components'),
        root: path.resolve(dir,'components')
      })
      let lis = ''
      files.forEach(a => {
        let name = a.split('/')[0]
        lis += `<li><a href="/c/${a}" target="_blank">${name}</a></li>`
      })
      let htm = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>所有组件</title><style>body{background-color: #f8f8f8;} h1{margin: 30px 50px 0;} a{color: #2d8cf0;} a:active,a:hover{color: #2b85e4;} .dir-list{margin: 30px;line-height: 40px;} .dir-list a{font-size: 18px;line-height: 40px;}</style></head><body><h1>组件列表</h1><ol class="dir-list">${lis}</ol></body></html>`
      ctx.body = htm
    }
  ]
}