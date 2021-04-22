# html-webpack-autocdn-plugin

Webpack plugin for injecting cdn script/link tag in your html.

## Hot to use?

install `html-webpack-plugin` and `html-webpack-autocdn-plugin`

```npm
npm i -D html-webpack-plugin html-webpack-autocdn-plugin
```

Then,

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackAutoCdnPlugin = require("html-webpack-autocdn-plugin");

module.exports = {
  // ...

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
```

Then, It will do two work:

1. Add externals to webpack option.
2. Generate script/link tag in html.

## Options

### dependencies

- `externals`: Just like webpack externals option. Properly, like `ExternalItem`. It cannot be array. Its value will be merged into webpack externals.
- `transform`: transform function for generate cdn url dynamic. It has three parameters:
  - `name`: dependency name.
  - `version`: dependency version in your package.json. Maybe undefined.
  - `mode`: webpack mode option.

### js & css

This filed is an array. The type of its element is `object` or `string`.

- if `string`: load this url directly.
- if `object`, It has two properties.
  - `dev`: only when `mode === 'development'`, load this url.
  - `prod`: only when `mode !== 'development'`, load this ulr.
