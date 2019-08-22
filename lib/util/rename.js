/*
* @Author: sansui
* @title: 重命名文件
*/
const fs = require('fs-extra')
const path = require('path')
const { globPify } = require('./index')

const replaceName = async (dir, oldname, newname) => {
  if (oldname !== 'undefined') {
    let files = await globPify('**/*.*', {
      cwd: path.resolve(dir, oldname),
      realpath: true
    })
    let reg = new RegExp(`${oldname}\.(js|less|scss|html)$`,'i')
    await Promise.all(
      files.filter(filename => reg)
        .map(async filename => {
          const oldpath = filename
          // 1、文件内容同步更改
          let content = fs.readFileSync(filename, 'utf-8')
          content = content.replace(new RegExp(`${oldname}`, 'g'), newname)
          fs.writeFileSync(filename, content, 'utf-8')
          // 2、文件名更改
          let nname = filename
          nname = nname.replace(reg, newname + '.$1')
          fs.renameSync(oldpath, nname)
        })
    )
    // 最后改目录
    fs.renameSync(path.resolve(dir, oldname), path.resolve(dir, newname))
  }
}

module.exports = replaceName
