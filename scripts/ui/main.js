class MainUI {
    constructor(kernel) {
        this.kernel = kernel
        this.password = null
    }

    ui_main() {
        const { Factory } = require("./main/factory")
        new Factory(this.kernel).render()
    }

    ui_keyboard() {
        const { KeyboardUI } = require("./keyboard/keyboard")
        new KeyboardUI(this.kernel).render()
    }

    render() {
        this.ui_keyboard()
        return
        switch ($app.env) {
            case $env.app:
                this.ui_main()
                break
            case $env.keyboard:
                this.ui_keyboard()
                break
            default:
                $ui.alert({
                    title: $l10n("ALERT_INFO"),
                    message: "该功能正在开发，敬请期待！",
                })
        }

    }
}

module.exports = {
    MainUI: MainUI
}