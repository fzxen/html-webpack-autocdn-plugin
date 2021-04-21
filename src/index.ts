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
  (version: string, mode: EnvMode): string;
}

interface Options {
  dependencies?: {
    [props: string]: {
      external: string;
      js?: CdnAssetsObject | CdnAssetsFn | string;
      css?: CdnAssetsObject | CdnAssetsFn | string;
    };
  };
  js?: Array<CdnAssetsObject | string>;
  css?: Array<CdnAssetsObject | string>;
}

class HtmlWebpackAutoCdnPlugin {
  private options: Options;
  private dependencies: PlainObj<string> =
    require(path.resolve(process.cwd(), "package.json"))?.dependencies ?? {};
  private externals: PlainObj<any> = {};

  private jsAssets: string[] = [];
  private cssAssets: string[] = [];

  private mode: EnvMode = "development";
  private isDev: boolean = true;

  constructor(options: Options) {
    this.options = options;

    const dependencies = options.dependencies ?? {};
    for (const name of Object.keys(dependencies)) {
      const dependency = dependencies[name];
      Object.assign(this.externals, { [name]: dependency.external });
    }
  }

  apply(compiler: Compiler) {
    // mode
    this.mode = compiler.options.mode ?? this.mode;
    this.isDev = this.mode === "development";

    // assets
    const { dependencies = {}, js = [], css = [] } = this.options;
    for (const name of Object.keys(dependencies)) {
      const { js, css } = dependencies[name];
      js && this.handleAssets(js, this.jsAssets, name);
      css && this.handleAssets(css, this.cssAssets, name);
    }
    for (const asset of js) this.handleAssets(asset, this.jsAssets);
    for (const asset of css) this.handleAssets(asset, this.cssAssets);

    // external
    const oldExternals = compiler.options.externals;
    if (Array.isArray(oldExternals)) oldExternals.push(this.externals);
    else compiler.options.externals = [oldExternals, this.externals];

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
    asset: CdnAssetsObject | CdnAssetsFn | string,
    arr: string[],
    name?: string
  ) {
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
      const url = asset(version, this.mode);
      url && arr.push(url);
    }
  }
}

export = HtmlWebpackAutoCdnPlugin;
