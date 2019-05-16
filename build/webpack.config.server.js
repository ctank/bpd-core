require('./check-versions')()

var env = process.env.NODE_ENV === 'watch' ? 'watch' : 'hot'

process.env.NODE_ENV = 'development'

var opn = require('opn')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var webpackDevServer = require('webpack-dev-server')
var webpackConfig = require('./webpack.config')
var HtmlWebpackPlugin = require('html-webpack-plugin')

webpackConfig.plugins.push(
  new HtmlWebpackPlugin({
    filename: 'dist/index.html',
    template: '../static/index.html'
  })
)

var compiler = webpack(webpackConfig)

if (env == 'watch') {
  var watching = compiler.watch(
    {
      aggregateTimeout: 300,
      poll: true,
      ignored: /node_modules/
    },
    function(err, stats) {
      console.log('> ' + chalk.red('启动监听...') + '\n')
      console.log(
        stats.toString({
          chunks: false,
          colors: true
        }) + '\n'
      )
      console.log('> PS: ' + chalk.cyan('快捷键Ctrl+C可终止监听'))
    }
  )
} else {
  var express = require('express')
  var webpackDevMiddleware = require('webpack-dev-middleware')
  var webpackHotMiddleware = require('webpack-hot-middleware')
  var proxyMiddleware = require('http-proxy-middleware')

  var config = {
    entry: {
      app: './src/app.js'
    },
    dev: {
      env: 'development',
      port: 9092,
      assetsSubDirectory: './static',
      assetsPublicPath: '',
      cssSourceMap: false
    }
  }
  var port = config.dev.port
  var app = express()
  var devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  })

  var hotMiddleware = webpackHotMiddleware(compiler, {
    log: () => {}
  })

  // app.use(
  //   '/api',
  //   proxyMiddleware({ target: 'http://www.example.org', changeOrigin: true })
  // )
  app.use(devMiddleware)
  app.use(hotMiddleware)
  var staticPath = path.posix.join(
    config.dev.assetsPublicPath,
    config.dev.assetsSubDirectory
  )
  app.use(staticPath, express.static('./'))
  //app.use(staticPath, express.static('./images'));

  app.use(express.static(path.join(__dirname, '../static')))
  //app.use('images', express.static(path.join(__dirname, 'public')))

  var uri = 'http://localhost:' + port

  devMiddleware.waitUntilValid(function() {
    console.log('> ' + chalk.red('监听地址: ') + uri + '\n')
    console.log('> PS: ' + chalk.cyan('快捷键Ctrl+C可终止监听'))
  })

  module.exports = app.listen(port, function(err) {
    if (err) {
      console.log(err)
      return
    }
  })
}
