const path = require('path');

module.exports = {
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'lib'),
    publicPath: '/lib/'
  },
  module: {
    loaders: [
      {
        test: /\.png$/,
        loaders: [ 'url-loader?limit=7000' ]
      }
    ]
  }
};
