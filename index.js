const { readFileSync, existsSync, writeFileSync } = require("fs")
const crypto = require("crypto")
const path = require("path")

const pluginName = "AddSimpleSingleSpaBuildInfo"

class AddSimpleSingleSpaBuildInfo {
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
    generateBuildInfo: ({ name, version, time, packageJson, base64Hash, content }) =>
      `//@build-info|${name}|${version}|${time}|${base64Hash}\n`,
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
      let currectHash = ""
      // Check if build info exists
      if (content.indexOf("//@build-info|") === 0) {
        // get currect hash
        currectHash = content.split("|").reverse()[0]
        // remove the old build info
        content = content.replace(/\/\/@build-info\|.*\n/, "")
      }
      // Create a hash of the file
      const hashSum = crypto.createHash("sha256")
      hashSum.update(content)
      const base64Hash = hashSum.digest("base64")
      // test if first line is build info and it it's hash is the same as the current hash
      if (currectHash === base64Hash) {
        // No update!
      } else {
        // Generate the build info and add to top of file
        content = this.options.generateBuildInfo({ name, version, time, packageJson, base64Hash, content }) + content
        // Write the file
        writeFileSync(filePath, content)
      }
    },
  }
  constructor(options) {
    if (options) {
      this.options = Object.assign(this.options, options)
    }
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
      this.options.postBuild(compilation)
    })
  }
}

module.exports = AddSimpleSingleSpaBuildInfo
