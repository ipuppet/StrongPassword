const BaseUI = require("/scripts/ui/components/base-ui")

class Factory extends BaseUI {
    constructor(kernel) {
        super(kernel)
    }

    home() {
        const HomeUI = require("./home")
        let ui_interface = new HomeUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 0)
    }

    storage() {
        const StorageUI = require("./storage")
        let ui_interface = new StorageUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 1)
    }

    setting() {
        const SettingUI = require("./setting")
        let ui_interface = new SettingUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 2)
    }

    /**
     * 渲染页面
     */
    async render() {
        // 视图
        this.set_views([
            this.home(),
            this.storage(),
            this.setting()
        ])
        // 菜单
        this.set_menus([
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