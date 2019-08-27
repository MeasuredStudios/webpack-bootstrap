const devMode = process.env.NODE_ENV !== 'production';

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, options) => ({
  // devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: true }),
    ],
  },
  entry: {
    './js/app.js': glob.sync('./static/vendor/*.js').concat(['./js/app.js']),
  },
  output: {
    path: path.resolve(__dirname, '../priv/static'),
    publicPath: '/',
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Compile and extract CSS, SASS, & SCSS files
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          {
            // fallback to style-loader in development
            loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          },
          {
            // translates CSS into CommonJS modules
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader',
            options: { modules: true, importLoaders: 1 },
          },
          {
            // Run post css actions
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                // post css plugins, can be exported to postcss.config.js
                return [require('precss'), require('autoprefixer')];
              },
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              removeCR: true,
              //sourceMap: true,
              engine: 'postcss',
            },
          },
          {
            // Converts SASS & SCSS to CSS
            loader: 'sass-loader',
            options: {
              //sourceMap: true,
              // sourceMapContents: false,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '../static/fonts/[name].[ext]',
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?name=images/[name].[ext]',
          'image-webpack-loader?bypassOnDebug',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode
        ? '../static/css/[name].css'
        : '../static/css/[name].[hash].css',
    }),
    new CopyWebpackPlugin([{ from: 'static/', to: '../' }]),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      Popper: 'popper.js',
      bootstrap: 'bootstrap',
    }),
  ],
});
