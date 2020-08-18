const MainUI = require("./ui/main")
const Generator = require("./generator")
const Storage = require("./storage")
const Setting = require("./setting")

class Kernel {
    constructor() {
        this.setting = new Setting()
        this.generator = new Generator(this.setting)
        this.storage = new Storage(this.setting)
    }
}

module.exports = {
    run: () => {
        // 实例化应用核心
        let kernel = new Kernel()
        // 渲染UI
        new MainUI(kernel).render()
    }
}