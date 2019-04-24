/*
* @Author: shl
* @title: 
* @Date:   2019-04-24 10:28:50
* @Last Modified by:   smm
* @Last Modified time: 2019-04-24 21:04:20
*/
const fs = require('fs-extra')
const glob = require('glob')
function pify (fn) {
  return (...args) => new Promise((resolve, reject) => {
    let callback = (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    }

    fn(...args, callback)
  })
}

function globPify(...args) {
  return pify(glob)(...args)
}

function readFile(filename) {
  return new Promise((reject, resolve) => {
    fs.readFile(filename, 'utf-8', (err,data) => {
      if(err){
        resolve(err)
      }
      reject(data)
    })
  })
}

function subObject(obj, names) {
  let result = {}
  for (let i = 0; i < names.length; i++) {
    if (obj[names[i]] !== undefined) {
      result[names[i]] = obj[names[i]]
    }
  }
  return result
}

/**
 * 修改的文件是否在pages或components目录下，是则需要编译
 * @return {Boolean} 是否需要编译
 */
function isNeedCompile(dir,pathname) {
  let basename = path.basename(pathname)
  let limitDir = ['pages','components']
  let limitPath = []
  limitDir.forEach(d => {
    limitPath.push(path.resolve(path.resolve(dir,d),path.basename(basename, path.extname(basename))))
  })
  console.log(limitPath)
}

module.exports = {
  globPify,
  readFile,
  subObject,
  isNeedCompile
}