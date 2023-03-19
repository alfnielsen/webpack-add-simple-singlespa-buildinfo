const { readFileSync, existsSync, writeFileSync } = require("fs")
const path = require("path")

const pluginName = "AddSimpleSingleSpaBuildInfo"

class AddSimpleSingleSpaBuildInfo {
  options = {
    getPackageJson: () => require("./package.json"),
    getName: (packageJson) => packageJson.name,
    getVersion: (packageJson) => packageJson.version,
    getTime: (packageJson) => new Date().toISOString(),
    getFileName: (packageName) => packageName.replace(/@/, "").replace(/[\\\/]/g, "-"),
    getFilePath: (packageFileName) =>
      path.join(__dirname, "dist", `${packageFileName}.js`),
    generateBuildInfo: (name, version, time, packageJson, content) =>
      `//@build-info|${name}|${version}|${time}\n`,
  }
  constructor(options) {
    if (options) {
      this.options = Object.assign(this.options, options)
    }
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
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
      content = generateBuildInfo(name, version, time, packageJson, content) + content
      // Write the file
      writeFileSync(filePath, content)
    })
  }
}

module.exports = AddSimpleSingleSpaBuildInfo
