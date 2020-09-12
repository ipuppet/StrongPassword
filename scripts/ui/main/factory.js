const BaseUI = require("/scripts/ui/components/base-ui")

class Factory extends BaseUI {
    constructor(kernel) {
        super(kernel)
    }

    home() {
        const HomeUI = require("./home")
        let interfaceUi = new HomeUI(this.kernel, this)
        return this.creator(interfaceUi.getViews(), 0)
    }

    storage() {
        const StorageUI = require("./storage")
        let interfaceUi = new StorageUI(this.kernel, this)
        return this.creator(interfaceUi.getViews(), 1)
    }

    setting() {
        const SettingUI = require("./setting")
        let interfaceUi = new SettingUI(this.kernel, this)
        return this.creator(interfaceUi.getViews(), 2, false)
    }

    /**
     * 渲染页面
     */
    async render() {
        // 视图
        this.setViews([
            this.home(),
            this.storage(),
            this.setting()
        ])
        // 菜单
        this.setMenus([
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
        ])
        super.render()
    }
}

module.exports = Factory