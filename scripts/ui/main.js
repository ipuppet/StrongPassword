class MainUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    mainUi() {
        const Factory = require("./main/factory")
        new Factory(this.kernel).render()
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