const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const projRoot = path.resolve(__dirname, '/');
const distFolder = path.resolve(__dirname, 'dist');

module.exports = (env, options) => ({
  // devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: true }),
    ],
  },
  entry: {
    app: glob.sync('./src/vendor/*.js').concat(['./src/js/app.js']),
  },
  output: {
    path: distFolder,
    publicPath: '/dist',
    filename: '[name].bundle.js',
    chunkFilename: 'js/[id].[chunkhash].chunk',
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
            // fallback to style-loader in production
            loader: devMode ? MiniCssExtractPlugin.loader : 'style-loader',
          },
          {
            // translates CSS into CommonJS modules
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader',
            options: { modules: false, importLoaders: 1 },
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
            name: 'fonts/[name].[ext]',
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
    // new CleanWebpackPlugin(['css', 'favicon', 'fonts', 'images', 'js'], {
    // root: distFolder,
    // }),
    // new CopyWebpackPlugin([{ from: "static/**/*", to: path.resolve(distFolder, "../")}]),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
  ],
});
