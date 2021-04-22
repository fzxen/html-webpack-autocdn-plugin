const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackAutoCdnPlugin = require("../dist/index.js");
const path = require("path");

const ab = (r) => path.resolve(__dirname, r);

const compiler = webpack({
  entry: ab("./index"),
  output: {
    filename: "[name].js",
    path: ab("./dist"),
  },

  mode: "production",

  plugins: [
    new HtmlWebpackPlugin({
      template: ab("./index.html"),
      inject: "body",
    }),
    new HtmlWebpackAutoCdnPlugin({
      dependencies: {
        externals: {
          vue: "vue",
        },
        transform(name, version, mode) {
          const isDev = mode === "development";
          const dependency = `${name}@${version}${isDev ? "" : ".min"}.js`;
          return {
            js: `https://unpkg.com/${dependency}.js`,
            css: `https://unpkg.com/${dependency}.css`,
          };
        },
      },
      js: ["https://unpkg.com/vue-router@4"],
    }),
  ],
});

compiler.run((err, stats) => {
  err && console.log(err);

  if (stats?.hasErrors()) {
    const json = stats.toJson();
    console.log(json?.errors?.[0]?.message);
  }
});
