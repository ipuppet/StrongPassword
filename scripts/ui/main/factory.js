const BaseUI = require("/scripts/ui/components/base-ui")

class Factory extends BaseUI {
    constructor(kernel) {
        super(kernel)
        // 视图与菜单对应关系
        this.page_index = [// 通过索引获取页面id
            "home",// 0 => 首页
            "storage",// 1 => 储藏室
            "setting",// 2 => 设置
        ]
        // 视图
        this.views = [
            this.home(),
            this.storage(),
            this.setting(),
        ]
        // 菜单
        this.menu_data = [
            {
                icon: { symbol: "lock.circle" },
                title: { text: $l10n("PASSWORD") }
            },
            {
                icon: { symbol: "archivebox" },
                title: { text: $l10n("STORAGE") }
            },
            {
                icon: { symbol: "gear" },
                title: { text: $l10n("SETTING") }
            }
        ]
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
}

module.exports = Factory