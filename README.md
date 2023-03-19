# webpack-add-simple-singlespa-buildinfo

Adds one line in top of output file build with webpack (target single-spa) with name, version and time.

Very simple build-info plugin.

## Install

> npm i webpack-add-simple-singlespa-buildinfo

## Usage

```js
var AddSimpleSingleSpaBuildInfo = require("webpack-add-simple-singlespa-buildinfo")
```

_Webpack config:_

```js
    plugins: [
      new AddSimpleSingleSpaBuildInfo(/*{ override options if needed... }*/)
    ],
```

## Options (default):

```js
options = {
  getPath: () => {
    let caller = module.parent.filename
    let dir = path.dirname(caller)
    return dir
  },
  getPackageJson: () => {
    let dir = this.options.getPath()
    let packageJsonPath = path.join(dir, "package.json")
    let packageJson = readFileSync(packageJsonPath, "utf8")
    return JSON.parse(packageJson)
  },
  getName: (packageJson) => packageJson.name,
  getVersion: (packageJson) => packageJson.version,
  getTime: (packageJson) => new Date().toISOString(),
  getFileName: (packageName) => packageName.replace(/@/, "").replace(/[\\\/]/g, "-"),
  getFilePath: (packageFileName) => {
    let dir = this.options.getPath()
    return path.join(dir, "dist", `${packageFileName}.js`)
  },
  generateBuildInfo: (name, version, time, packageJson, content) =>
    `//@build-info|${name}|${version}|${time}\n`,
  postBuild: (compilation) => {
    // Get the package.json file
    const packageJson = this.options.getPackageJson()
    // Get the name of the package
    const name = this.options.getName(packageJson)
    // Remove @ and '/' '\' (for organization packages)
    const fileName = this.options.getFileName(name)
    // Get the time of the build
    const time = this.options.getTime(packageJson)
    // Get the version of the package
    const version = this.options.getVersion(packageJson)
    // Format file name matching single-spa build : dist/org-name-project-name.js
    const filePath = this.options.getFilePath(fileName)
    // load the file
    let content = readFileSync(filePath, "utf8")
    // Generate the build info and add to top of file
    content =
      this.options.generateBuildInfo(name, version, time, packageJson, content) + content
    // Write the file
    writeFileSync(filePath, content)
  },
}
```

## Details

The **postBuild** options is the entire plugin!

This is just a simple hook into post build, to add build info to the output file.
