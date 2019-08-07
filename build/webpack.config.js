var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
var entry =
  process.env.NODE_ENV === 'production'
    ? './src/main.js'
    : ['babel-polyfill', './src/main.js']
var type = process.env.type === 'UMD' ? 'umd' : ''

var webpackConfig = {
  entry: {
    'bpd-core': entry
  },
  output: {
    publicPath: '',
    filename: 'js/[name].js?v=[chunkhash:8]',
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader!postcss-loader!sass-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: env === 'production' ? true : false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: loader => [
                  require('autoprefixer')({
                    //CSS浏览器兼容
                    overrideBrowserslist: ['ie>=8', '>1% in CN']
                  })
                ]
              }
            },
            {
              loader: 'sass-loader'
            }
          ],
          publicPath: '../'
        })
      },
      {
        test: /\.(jsx?|es6)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        include: [path.join(__dirname, '..', 'src')]
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?v=[hash:8]',
              outputPath: 'img/'
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?v=[hash:8]',
              outputPath: 'font/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: "'" + env + "'"
      }
    }),
    new webpack.ProvidePlugin({}),
    new ExtractTextPlugin({ filename: 'css/[name].css?v=[chunkhash:8]' }),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],
  resolve: {
    extensions: ['.js', 'json', '.css', '.scss']
  }
}

if (env == 'production') {
  process.env.BABEL_ENV = 'production'
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: true,
      comments: false,
      sourceMap: false
    })
  )
  webpackConfig.plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: path.resolve(__dirname, '../dist')
      }
    ])
  )
} else {
  process.env.BABEL_ENV = 'development'
  webpackConfig.devtool = 'cheap-module-eval-source-map'
}

if (type == 'umd') {
  // 组件采用UMD格式打包
  webpackConfig.output.libraryTarget = 'umd'
  // 组件名称
  webpackConfig.output.library = ''

  webpackConfig.output.filename = 'js/[name].umd.js?v=[chunkhash:8]'
}

module.exports = webpackConfig
