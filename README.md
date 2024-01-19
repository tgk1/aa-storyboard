# AA Storyboard (AAストーリーボード)

アスキーアート用のエディターです。

AsciiArt Editor.
An Electron application with Vue and TypeScript.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup
* node.jsはバージョン20.0.0以上を推奨します。
* better-sqlite3は各環境のビルド済みバイナリファイルを提供していますが、条件によってはない場合もあります。ビルドする場合、macOSではXcode、WindowsではVisual Studio Community and Desktop Development with C++ extensionとpythonが必要になります。

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
# 管理者モードのコンソールで実行すること。しないとsymlinkエラーが発生する。
$ npm run build:win

# For macOS
$ ./node_modules/.bin/electron-rebuild
$ npm build
$ npm run build:mac

# For macOS(arm64), build x86_64 package
# arm64環境でintelバイナリをビルドする場合。これをしないとsqliteのバイナリでdl_openエラーが発生する。
$ ./node_modules/.bin/electron-rebuild  --arch=x64
$ npm build
$ npm run build:mac
```

### 補足
* [Electron⚡️Vite](https://electron-vite.github.io/) と、そのテンプレートをその使っています。"/src/renderer/src"とあるので、たぶん(electron-vite-vue v1.0.0)のはずです。
* [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) はネイティブモジュールを使用しています。これが原因でビルド時にエラーになるかもしれません。エラーの内容によってはbetter-sqlite3のトラブルシューティングガイドで解決できます。
* /locales/のyamlファイルと/lib/i18nファイルで多言語化できるはずです。

