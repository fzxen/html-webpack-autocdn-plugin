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
    }),
    new HtmlWebpackAutoCdnPlugin({
      dependencies: {
        vue: {
          external: "vue",
          js: (version, mode) => {
            console.log("vue", version, mode);
            return "https://unpkg.com/vue@next";
          },
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
