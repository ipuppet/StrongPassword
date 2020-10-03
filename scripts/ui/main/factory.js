const BaseView = require("../../../EasyJsBox/src/Foundation/view")

class Factory extends BaseView {
    constructor(kernel) {
        super(kernel)
        // 设置初始页面
        this.kernel.page.controller.setSelectedPage(0)
    }

    home() {
        const HomeUI = require("./home")
        let interfaceUi = new HomeUI(this.kernel, this)
        return this.kernel.page.view.creator(interfaceUi.getViews(), 0)
    }

    storage() {
        const StorageUI = require("./storage")
        let interfaceUi = new StorageUI(this.kernel, this)
        return this.kernel.page.view.creator(interfaceUi.getViews(), 1)
    }

    setting() {
        return this.kernel.page.view.creator(this.kernel.getComponent("Setting").view.getViews(), 2, false)
    }

    /**
     * 渲染页面
     */
    render() {
        this.kernel.render([
            this.home(),
            this.storage(),
            this.setting()
        ], [
            {
                icon: ["lock.circle", "lock.circle.fill"],
                page: "home",
                title: $l10n("PASSWORD")
            },
            {
                icon: ["archivebox", "archivebox.fill"],
                page: "storage",
                title: $l10n("STORAGE")
            },
            {
                icon: "gear",
                page: "setting",
                title: $l10n("SETTING")
            }
        ])()
    }
}

module.exports = Factory