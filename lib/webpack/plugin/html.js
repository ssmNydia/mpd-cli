/*
* @Author: sansui
* @title: html-webpack-plugin 插件在hooks的相关步骤中处理组件和配置引入信息的写入
*/
const HtmlWebpackPlugin = require('html-webpack-plugin')
const injectCode = require('./inject')

class HtmlKoaWebpackPlugin {
  constructor(options) {
    this.$data = options
  }

  apply (compiler) {
    const config = this.$data.config

    config.publicPath.source = config.publicPath.source.replace(/\/$/, '') || ''
    compiler.hooks.compilation.tap('HtmlKoaWebpackPlugin', (compilation) => {

      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('HtmlKoaWebpackPlugin', (data, cb) => {
        // console.log('alterAssetTagGroups')
        
        let pageName = data.outputName.replace('.html', '')
        // console.log('pageName', pageName)
        // console.log('headTags', data.headTags)
        // console.log('bodyTags', data.bodyTags)
        // 配置引入信息
        data.headTags.forEach(obj => {
          if (config.env === 'development') {
            obj.attributes.href = `/${pageName}.css`
          }
        })
        data.bodyTags.forEach(obj => {
          if (config.env === 'development') {
            obj.attributes.src = `/${pageName}.js`
          }
        })
        // console.log('config', config)
        let headTags = []
        let bodyTags = []
        // 加入配置的全局库
        config.global.forEach(obj => {
          if (typeof obj === 'string') {
            let src = obj
            if (src.substring(0, 3) !== 'http' && config.env !== 'development') {
               // 打包时，更换路径为 config.publicPath.source
               src = config.publicPath.source + (src.substring(0, 1) !== '/' ? '/' : '') + src
            }
            let o = {
              voidTag: false,
              attributes: { defer: false, src }
            }
            if (src.indexOf('.css') > -1) {
              o.tagName = 'link'
              o.voidTag = true
              o.attributes = { href: src, rel: 'stylesheet' }
              headTags.push(o)
            } else {
              o.tagName = 'script'
              bodyTags.push(o)
            }
          } else {
            let src = obj.url
            if (src.substring(0, 3) !== 'http' && config.env !== 'development') {
               // 打包时，更换路径为 config.publicPath.source
               src = config.publicPath.source + (src.substring(0, 1) !== '/' ? '/' : '') + src
            }
            let o = {
              voidTag: false,
              attributes: { defer: false, src }
            }
            if (obj.ishead) {
              if (src.indexOf('.css') > -1) {
                o.tagName = 'link'
                o.voidTag = true
                o.attributes = { href: src, rel: 'stylesheet' }
              } else {
                o.tagName = 'script'
              }
              headTags.unshift(o)
            } else {
              if (src.indexOf('.css') > -1) {
                o.tagName = 'link'
                o.voidTag = true
                o.attributes = { href: src, rel: 'stylesheet' }
                headTags.push(o)
              } else {
                o.tagName = 'script'
                bodyTags.push(o)
              }
            }
          }
        })

        // 加入指定页面的库
        config.assign.forEach(obj => {
          if (obj.pages.includes(pageName)) {
            obj.urls.forEach(src => {
              if (src.substring(0, 3) !== 'http' && config.env !== 'development') {
                 // 打包时，更换路径为 config.publicPath.source
                 src = config.publicPath.source + (src.substring(0, 1) !== '/' ? '/' : '') + src
              }
              let o = {
                voidTag: false,
                attributes: { defer: false, src }
              }
              if (src.indexOf('.css') > -1) {
                o.tagName = 'link'
                o.voidTag = true
                o.attributes = { href: src, rel: 'stylesheet' }
                headTags.push(o)
              } else {
                o.tagName = 'script'
                bodyTags.push(o)
              }
            })
          }
        })
        data.headTags = headTags.concat(data.headTags)
        data.bodyTags = bodyTags.concat(data.bodyTags)

        // console.log('headTags', data.headTags)
        // console.log('bodyTags', data.bodyTags)

        cb(null, data)
      })
      
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('HtmlKoaWebpackPlugin', (data, cb) => {
        // console.log('beforeEmit')
        // 注入 livereload 脚本
        if (config.livereload) {
          let htm = data.html
          // console.log('htm', htm)
          let beforeBodyEnd = htm.split('</body>')[0] 
          data.html = beforeBodyEnd + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':${config.liveport}/livereload.js?snipver=1"></' + 'script>')</script></body></html>`
        }

        if (config.env !== 'development') {
          // 美化代码排版
          data.html = data.html.replace(/<\/script>/g, '<\/script>\n').replace(/rel="stylesheet">/g, 'rel="stylesheet">\n').replace(/<script/g, '  <script').replace(/<link/g, '  <link')
        }
        cb(null, data)
      })
      
    })
  }
}

module.exports = HtmlKoaWebpackPlugin
