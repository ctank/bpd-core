require('./check-versions')()

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var webpackConfig = require('./webpack.config.js')
var type = process.env.type === 'UMD' ? 'UMD' : ''

var spinner = ora(' 正在打包...')
spinner.start()

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) throw err
  process.stdout.write(
    stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n'
  )

  console.log('> ' + chalk.cyan(type + '打包完成\n'))
})
