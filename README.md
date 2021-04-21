# html-webpack-autocdn-plugin

Webpack plugin for injecting cdn script/link tag in your html.

## Examples

### Simple

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
    }),
    new HtmlWebpackAutoCdnPlugin({
      dependencies: {
        vue: {
          external: "vue", // just like webpack externals(Properly, like ExternalItem)
          js: ["https://unpkg.com/vue@next"],
          css: ["https://unpkg.com/xxx.css"],
        },
      },
      js: ["https://unpkg.com/vue-router@4"],
      css: ["https://xxx/xxx.css"],
    }),
  ],
});
```

Then, It will do two work:

1. Add externals to webpack option
2. Generate script/link tag in html.

### Advance

The `js` `css` filed in dependencies can be `string` `object` or `function`

```javascript
new HtmlWebpackAutoCdnPlugin({
  dependencies: {
    vue: {
      external: "vue",

      // object
      js: {
        dev: "https://xxx.com/vue@next",
        prod: "https://xxx.com/vue.min@next"
      }
    },
    'vue-router': {
      external: "vueRouter",
      
      // function
      js(version, mode) {
        // ...
        return `https://xxx.cdn/vue-router${version}.js`
      }
    }
  },
}),
```
if type is `object`:

- when `mode === 'development'`, load **dev cdn**.
- when `mode !== 'development'`, load **prod cdn**.

if type is `function`:

- `version`: The dependency version in package.json, may be undefined.
- `mode`: Just equal to webpack mode option.

While, Type of `js` and `css` outside of `dependencies` is an `array`. Element of it can be `string` or `object`.

## Options

check `dist/index.d.ts` to get type definition help.