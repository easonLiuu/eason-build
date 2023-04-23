const semver = require('semver')

module.exports = function checkNode(minNodeVersion) {
    const nodeVersion = semver.valid(semver.coerce(process.version))
    console.log(nodeVersion)
    return semver.satisfies(nodeVersion, '>=' + minNodeVersion)
}