const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve('dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
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
    resolve: {
      extensions: ['.js', '.ts'],
    },
  };