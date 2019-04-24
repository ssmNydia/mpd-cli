/*
* @Author: shl
* @title: 
* @Date:   2019-04-23 14:18:20
* @Last Modified by:   shl
* @Last Modified time: 2019-04-23 14:19:57
*/
const app = require('./lib/server')

const config = require('./config')

app(config.dev)