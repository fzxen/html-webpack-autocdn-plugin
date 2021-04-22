import type { Compiler } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";

type EnvMode = "development" | "production" | "none";

interface PlainObj<T = any> {
  [props: string]: T;
}

interface CdnAssetsObject {
  dev?: string;
  prod?: string;
}

interface CdnAssetsFn {
  (name: string, version: string, mode: EnvMode): {
    js?: string;
    css?: string;
  };
}

interface Options {
  dependencies?: {
    externals: PlainObj;
    transform: CdnAssetsFn;
  };
  js?: Array<CdnAssetsObject | string>;
  css?: Array<CdnAssetsObject | string>;
}

class HtmlWebpackAutoCdnPlugin {
  private options: Options;
  private dependencies: PlainObj<string> =
    require(path.resolve(process.cwd(), "package.json"))?.dependencies ?? {};

  private jsAssets: string[] = [];
  private cssAssets: string[] = [];

  private mode: EnvMode = "development";
  private isDev: boolean = true;

  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    // * mode
    this.mode = compiler.options.mode ?? this.mode;
    this.isDev = this.mode === "development";

    // * assets
    const { dependencies, js = [], css = [] } = this.options;
    // assets - dependencies
    if (dependencies !== undefined) {
      const { transform, externals } = dependencies;
      for (const name of Object.keys(externals)) {
        this.handleAssets(this.jsAssets, transform, name);
      }
    }
    // assets - other
    for (const asset of js) this.handleAssets(this.jsAssets, asset);
    for (const asset of css) this.handleAssets(this.cssAssets, asset);

    // * external
    const external = this.options.dependencies?.externals;
    if (external) {
      const oldExternals = compiler.options.externals;
      if (Array.isArray(oldExternals)) oldExternals.push(external);
      else compiler.options.externals = [oldExternals, external];
    }

    // * hook
    compiler.hooks.compilation.tap(
      "HtmlWebpackAutoCdnPlugin",
      (compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);
        hooks.beforeAssetTagGeneration.tapAsync(
          "HtmlWebpackAutoCdnPlugin",
          (data, cb) => {
            data.assets.js.unshift(...this.jsAssets);
            data.assets.css.unshift(...this.cssAssets);

            cb();
          }
        );
      }
    );
  }

  handleAssets(
    arr: string[],
    asset?: CdnAssetsObject | CdnAssetsFn | string,
    name?: string
  ) {
    if (asset === undefined) return;
    // str
    if (typeof asset === "string") arr.push(asset);
    // obj
    else if (typeof asset === "object") {
      if (this.isDev && asset.dev) arr.push(asset.dev);
      else if (!this.isDev && asset.prod) arr.push(asset.prod);
    }
    // fn
    else if (typeof asset === "function" && name !== undefined) {
      let version = this.dependencies[name];
      if (version !== undefined) {
        const sign = version.slice(0, 1);
        if (sign === "^" || sign === "~") version = version.slice(1);
      }
      const { js, css } = asset(name, version, this.mode) ?? {};
      if (typeof js === "function") return;
      this.handleAssets(this.jsAssets, js, name);

      if (typeof css === "function") return;
      this.handleAssets(this.cssAssets, css, name);
    }
  }
}

export = HtmlWebpackAutoCdnPlugin;
