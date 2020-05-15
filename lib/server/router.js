/*
* @Author: shl
* @title: 
* @Date:   2020-03-23 15:13:40
* @Last Modified by:   shl
* @Last Modified time: 2020-05-15 10:43:15
*/
const path = require('path')

module.exports  =  function (router, middlewares) {

  router.all('*', ...middlewares)

  return router
}