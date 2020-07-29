const Generator = require("./generator").Generator
const Storage = require("./storage").Storage
const UI = require("./ui").UI

class Kernel {
    generator = null
    storage = null

    constructor() {
        this.generator = new Generator()
        this.storage = new Storage()
    }

    generate_strong_password() {
        return this.generator.generate()
    }
}

function run() {
    // 实例化应用核心
    let kernel = new Kernel()
    // 渲染UI
    new UI(kernel).render()
}

module.exports = {
    run: run
}