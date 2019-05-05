/*
* @Author: shl
* @title: 
* @Date:   2019-04-24 10:28:50
* @Last Modified by:   shl
* @Last Modified time: 2019-04-26 14:58:40
*/
const path = require('path')
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
  let dirname = ''
  if(pathname.indexOf('components')>-1){
    dirname = pathname.replace(path.resolve(dir,'components'),'').replace(basename,'')
  }
  if(pathname.indexOf('pages')>-1){
    dirname = pathname.replace(path.resolve(dir,'pages'),'').replace(basename,'')
  }

  let limitDir = ['pages','components']
  let limitPath = []

  console.log('one: ',path.resolve(dir,'pages'))
  console.log('two: ',path.resolve(
        path.resolve(dir,'pages'),
        dirname
      ))

  limitDir.forEach(d => {
    limitPath.push(path.resolve(
      dir,
      d+dirname,
      basename
    ))
  })

  return limitPath[0]===path.resolve(pathname) || limitPath[1]===path.resolve(pathname)
}

module.exports = {
  globPify,
  readFile,
  subObject,
  isNeedCompile
}