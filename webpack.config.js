const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    bundle: [
      './src/index'
    ],
    examples: [
      './examples/app.jsx'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loaders: [ 'babel-loader' ],
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, 'examples')
        ]
      }
    ]
  }
};
