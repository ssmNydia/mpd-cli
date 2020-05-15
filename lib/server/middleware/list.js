/*
* @Author: sansui
* @title: 列表页渲染
*/
const path = require('path')
const glob = require('glob')

module.exports = async function (options) {
  return [
    async (ctx, next) => {
      let files = glob.sync('*/index.html', {
        cwd: path.resolve(options.dir,'components'),
        root: path.resolve(options.dir,'components')
      })
      let lis = ''
      let scps = ''
      files.forEach(a => {
        let name = a.split('/')[0]
        lis += `<li>
          <a href="/c/${a}" target="_blank">${name}</a>
          <div class="ifm">
            <iframe id="${name}" src="/c/${a}" frameborder="0"></iframe>
            <div class="mask"></div>
          </div>
        </li>`
        scps += `\ndocument.getElementById('${name}').contentWindow.document.body.style.transform= 'scale(0.5) translate(-15px, -30px)';`
      })
      let htm = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>列表</title><style>body{padding:100px 0;text-align:center;background-color:#f8f8f8;font-size:14px}ul{padding:0}.list{margin:10px auto;padding:10px;max-width:480px;text-align:left;background-color:#fff;border-radius:4px}.list li{margin-bottom:20px;padding:10px;display:flex;justify-content:center;align-items:center;background-color: rgba(13, 23, 245, .02)}.list a{flex:1;font-size: 16px;color:#666}.list a:hover{color: #334EF9}.list .ifm{position:relative;width:240px;height:90px;overflow:hidden;background-color:#fff}.list .ifm .mask{position:absolute;top:0;left:0;width:240px;height:90px;z-index:2}.list iframe{position:absolute;z-index:1;top:0;width:300px;height:100px}</style></head><body><h1>组件列表</h1><div class="list"><ul>${lis}</ul></div><script>window.onload = function () { ${scps} }</script></body></html>`
      ctx.body = htm
    }
  ]
}
