const path = require('path')
const webpack = require('webpack')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCssnanoPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

var entry =
  process.env.NODE_ENV === 'production'
    ? './src/main.js'
    : ['core-js/stable', 'regenerator-runtime/runtime', './src/main.js']
var type = process.env.type === 'UMD' ? 'umd' : ''

var webpackConfig = {
  mode: NODE_ENV,
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
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              plugins: loader => [
                require('autoprefixer')({
                  //CSS浏览器兼容
                  overrideBrowserslist: ['ie>=8', '>1% in CN']
                })
              ]
            }
          }
        ]
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              plugins: () => [
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
        ]
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
  optimization: {},
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),
    new MiniCssExtractPlugin(
      {
        filename: 'css/[name].css?v=[chunkhash:8]',
        ignoreOrder: true
      }
    ),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],
  resolve: {
    extensions: ['.js', 'json', '.css', '.scss']
  }
}

if (isDev) {
  // process.env.BABEL_ENV = 'development'
  webpackConfig.devtool = 'cheap-module-eval-source-map'
} else {
  // process.env.BABEL_ENV = 'production'
  webpackConfig.optimization.minimizer = [
    /* config.optimization.minimizer('terser') */
    new TerserPlugin(
      {
        extractComments: false,
        terserOptions: {
          ecma: undefined,
          warnings: false,
          condition: false,
          parse: {},
          compress: {
            drop_console: true,
            drop_debugger: false,
            pure_funcs: ['console.log'] // 移除console
          }
        }
      }
    )
  ]
  webpackConfig.plugins.push(
    new OptimizeCssnanoPlugin(
      {
        sourceMap: false,
        cssnanoOptions: {
          preset: [
            'default',
            {
              mergeLonghand: false,
              cssDeclarationSorter: false
            }
          ]
        }
      }
    )
  )
  webpackConfig.plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: path.resolve(__dirname, '../dist')
      }
    ])
  )
}

if (type == 'umd') {
  // 组件采用UMD格式打包
  webpackConfig.output.libraryTarget = 'umd'
  // 组件名称
  webpackConfig.output.library = ''

  webpackConfig.output.filename = 'js/[name].umd.js?v=[chunkhash:8]'
}

module.exports = webpackConfig
