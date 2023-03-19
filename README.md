# webpack-add-simple-singlespa-buildinfo

Adds one line in top of output file build with webpack (target single-spa) with name, version and time.

Very simple build-info plugin.

## Install

> npm i webpack-add-simple-singlespa-buildinfo

## Usage

```js
var AddSimpleSingleSpaBuildInfo = require("AddSimpleSingleSpaBuildInfo")
```

_Webpack config:_

```js
    plugins: [
      new AddSimpleSingleSpaBuildInfo(/*{ override options if needed... }*/)
    ],
```

## Options (default):

```js
    getPackageJson: () => require("./package.json"),
    getName: (packageJson) => packageJson.name,
    getVersion: (packageJson) => packageJson.version,
    getTime: (packageJson) => new Date().toISOString(),
    getFileName: (packageName) => packageName.replace(/@/, "").replace(/[\\\/]/g, "-"),
    getFilePath: (packageFileName) => path.join(__dirname, "dist", `${packageFileName}.js`),
    generateBuildInfo:generateBuildInfo: (name, version, time, packageJson, content) => `//@build-info|${name}|${version}|${time}\n`,
```
