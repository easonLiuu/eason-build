const path = require('path')

module.exports = function (api, params) {
    const dir = process.cwd()
    api.getWebpackConfig()
        .entry('login')
            .add(path.resolve(dir, 'src/login.js'))
            .end()
}