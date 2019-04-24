/*
* @Author: shl
* @title: 
* @Date:   2019-04-17 14:31:51
* @Last Modified by:   shl
* @Last Modified time: 2019-04-24 10:26:50
*/
const cli = require('./cli')
const {download} = require('./util/download')

module.exports = function() {
 download('template','',false, err=>{
  if(err){
      cli.error(`项目初始化失败：${err.message.trim()}`)
      return
    }

    cli.info(`mpd项目创建成功!`)
 })
}