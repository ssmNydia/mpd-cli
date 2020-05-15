/*
* @Author: sansui
* @title: 静态页面渲染： 404
*/

module.exports = function () {
  return `<!DOCTYPE html><html style="font-size:100px"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta name="format-detection" content="telephone=no"><title>404</title><style>body{padding:100px 0;text-align:center;background-color:#f8f8f8;font-size:14px}.list{margin:10px auto;padding:10px;max-width:400px;text-align:left;background-color:#fff;border-radius:4px}.list li{margin-bottom:10px}@media only screen and (max-width:768px){.list{max-width:3.2rem}}</style></head><body><h1>404</h1><h3>您访问的页面丢失了。</h3><h4>请依次检查：</h4><div class="list"><ol><li>访问链接是否已在路由配置里设置？</li><li>访问链接是否符合路由配置里设置的正则式？</li><li>路由配置里设置对应的页面是否名称正确？</li><li>对应的页面是否存在？</li></ol></div></body></html>`
}