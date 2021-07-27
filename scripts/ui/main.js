class MainUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    mainUi() {
        this.kernel.UIKit.disableLargeTitle()
        this.kernel.UIKit.setNavButtons([
            this.kernel.UIKit.navButton("storage", "archivebox", () => {
                this.kernel.UIKit.push({
                    title: $l10n("STORAGE"),
                    views: (() => {
                        const StorageUI = require("./main/storage")
                        const interfaceUi = new StorageUI(this.kernel, this)
                        return interfaceUi.getView()
                    })()
                })
            }),
            this.kernel.UIKit.navButton("setting", "gear", () => {
                this.kernel.UIKit.push({
                    title: $l10n("SETTING"),
                    views: this.kernel.setting.getView()
                })
            })
        ])
        const HomeUI = require("./main/home")
        const interfaceUi = new HomeUI(this.kernel, this)
        this.kernel.UIRender(interfaceUi.getView())
    }

    keyboardUi() {
        const KeyboardUI = require("./keyboard/keyboard")
        new KeyboardUI(this.kernel).render()
    }

    todayUi() {
        const TodayUI = require("./today/today")
        new TodayUI(this.kernel).render()
    }

    render() {
        switch ($app.env) {
            case $env.app:
                this.mainUi()
                break
            case $env.keyboard:
                this.keyboardUi()
                break
            case $env.today:
                this.todayUi()
                break
            default:
                $ui.alert({
                    title: $l10n("ALERT_INFO"),
                    message: "后续可能开发，敬请期待！"
                })
        }
    }
}

module.exports = MainUI