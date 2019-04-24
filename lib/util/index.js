/*
* @Author: shl
* @title: 
* @Date:   2019-04-24 10:28:50
* @Last Modified by:   shl
* @Last Modified time: 2019-04-24 16:17:44
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

module.exports = {
  globPify,
  readFile,
  subObject
}