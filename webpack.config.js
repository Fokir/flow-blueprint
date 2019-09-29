const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './example/index.ts',
    devtool: 'source-map',
    output: {
      path: path.resolve('dist'),
      filename: 'index.js',
    },
    module: {
      rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
          }
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './example/index.html'
      })
    ],
    // optimization: {
    //   minimizer: [new UglifyJsPlugin()],
    // },
    resolve: {
      extensions: ['.js', '.ts'],
    },
  };