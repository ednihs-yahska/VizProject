const path = require('path');
var glob = require("glob");

module.exports = {
  entry: {
      nyny: path.resolve(__dirname, 'public/js/index.js')
    },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.js$/, 
        exclude: [/node_modules/], 
        loader: "babel-loader",
        options: {
          presets: [
            {'plugins': ['@babel/plugin-proposal-class-properties']}
          ]
        } 
      }
    ]
  },
  mode: "development",
  watch: true
};